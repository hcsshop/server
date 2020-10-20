const crypto = require('crypto')
const parseAddress = require('parse-address')
const OAuthClient = require('intuit-oauth')
const { BadRequest, GeneralError, NotFound } = require('@feathersjs/errors')

exports.Quickbooks = class Quickbooks {
  constructor (options, app) {
    this.app = app
    this.logger = app.get('logger')
    this.oauth = this.app.get('intuit-oauth')
  }

  async api ({ action, query, urlParams, method, headers, body }) {
    try {
      const companyID = this.oauth.getToken().realmId
      if (!companyID) throw new Error('No company ID. Not connected to QB?')

      const url = this.oauth.environment !== 'production' ? OAuthClient.environment.sandbox : OAuthClient.environment.production
      const apiUrl = `${url}v3/company/${companyID}/${action}${urlParams ? `/${urlParams}` : ''}${query || ''}`

      this.logger.silly(`Contacting QB: ${apiUrl}`)
      let authResponse

      try {
        authResponse = await this.oauth.makeApiCall({
          method: method || 'GET',
          url: apiUrl,
          headers,
          body
        })

        if (authResponse.json.Fault) throw new Error(authResponse.json.fault.error)
        return { error: false, response: authResponse.json }
      } catch (err) {
        this.logger.error(err)
        return { error: err }
      }
    } catch (err) {
      this.logger.error(err)
      return { error: err }
    }
  }

  async convertCustomerToQuickbooks (customer) {
    if (!customer) return null
    const displayName = customer.profile.name.display
    const defaultDisplayName = `${customer.profile.name.first}${customer.profile.name.middle === '' ? '' : ' ' + customer.profile.name.middle}${customer.profile.name.last === '' ? '' : ' ' + customer.profile.name.last}`

    const qbCustomer = {
      PrimaryEmailAddr: { Address: customer.email },
      DisplayName: displayName && displayName !== '' ? displayName : defaultDisplayName,
      GivenName: customer.profile.name.first,
      MiddleName: customer.profile.name.middle,
      FamilyName: customer.profile.name.last
    }

    if (customer.profile.address.billing !== '') {
      const billData = parseAddress.parseLocation(customer.profile.address.billing)
      qbCustomer.BillAddr = { Line1: `${billData.number} ${billData.street} ${billData.type}` }
      if (billData.sec_unit_type) qbCustomer.BillAddr.Line2 = `${billData.sec_unit_type} ${billData.sec_unit_num}`
      qbCustomer.BillAddr.City = billData.city
      qbCustomer.BillAddr.CountrySubDivisionCode = billData.state
      qbCustomer.BillAddr.PostalCode = billData.zip
    }

    if (customer.profile.address.physicalSameAsBilling) {
      qbCustomer.ShipAddr = qbCustomer.BillAddr
    } else {
      if (customer.profile.address.physical !== '') {
        const shipData = parseAddress.parseLocation(customer.profile.address.physical)
        qbCustomer.ShipAddr = { Line1: `${shipData.number} ${shipData.street} ${shipData.type}` }
        if (shipData.sec_unit_type) qbCustomer.ShipAddr.Line2 = `${shipData.sec_unit_type} ${shipData.sec_unit_num}`
        qbCustomer.ShipAddr.City = shipData.city
        qbCustomer.ShipAddr.CountrySubDivisionCode = shipData.state
        qbCustomer.ShipAddr.PostalCode = shipData.zip
      }
    }

    if (customer.profile.phone && customer.profile.phone.primary) qbCustomer.PrimaryPhone = { FreeFormNumber: customer.profile.phone.primary.number }
    if (customer.profile.phone && customer.profile.phone.mobile) qbCustomer.Mobile = { FreeFormNumber: customer.profile.phone.mobile.number }
    if (customer.profile.phone && customer.profile.phone.fax) qbCustomer.Fax = { FreeFormNumber: customer.profile.phone.fax.number }

    qbCustomer.Notes = customer.notes
    if (customer.profile.company.isCompany) {
      qbCustomer.CompanyName = customer.profile.company.name
      qbCustomer.Taxable = !customer.profile.company.taxExempt
      if (customer.profile.company.taxId) qbCustomer.PrimaryTaxIdentifier = customer.profile.company.taxId
      if (customer.profile.company.website) qbCustomer.WebAddr = { URI: customer.profile.company.website }
    }

    return qbCustomer
  }

  async company (params) {
    const result = await this.api({
      action: 'companyinfo',
      urlParams: `/${this.oauth.getToken().realmId}`
    })

    return result
  }

  async customers (params) {
    const customers = []

    const results = await this.api({
      action: 'query',
      query: '?query=SELECT * FROM Customer MAXRESULTS 1000'
    })

    if (!results || results.error) throw new GeneralError('Error retrieving customers from Quickbooks', results ? results.error : results)
    const response = results.response ? results.response.QueryResponse : null
    if (!response) throw new GeneralError('Error retrieving customers from Quickbooks', results)
    const customerData = response.Customer
    if (!customerData) throw new NotFound('There was no Customer data in the Quickbooks response', response)

    customers.push(...customerData)
    const initialMaxResults = parseInt(response.maxResults)

    if (initialMaxResults === 1000) {
      let maxResults = initialMaxResults

      while (maxResults === 1000) {
        const newResults = await this.api({ action: 'query', query: `?query=SELECT * FROM Customer STARTPOSITION ${maxResults + 1} MAXRESULTS 1000` })
        customers.push(...newResults.response.QueryResponse.Customer)
        maxResults = parseInt(newResults.response.QueryResponse.maxResults)
      }
    }

    this.logger.debug('[QBO:SyncCustomers]', { metadata: `Fetched ${customers.length} customers` })
    return customers
  }

  async get (id, params) {
    if (typeof this[id] === 'function') return await this[id](params)
    return false
  }

  async syncCustomers (data, params) {
    // Merge remote with local
    // This is not the most efficient way to do it, especially for very large customer sets, but it works for now and can be refactored later
    const customers = await this.app.service('customers').find({ query: { $limit: -1 } })
    let qbCustomers = await this.app.service('quickbooks').get('customers')

    let downloadCustomers = []
    let updateCustomers = []
    let uploadCustomers = customers
    let downloaded = 0
    let uploaded = 0
    let updated = 0

    await Promise.all(qbCustomers.map(async customer => {
      if (!customer.Active) return
      // const local = customers.find(c => c.quickbooksID === customer.Id)

      const customerData = {
        email: customer.PrimaryEmailAddr ? customer.PrimaryEmailAddr.Address : null,
        notes: customer.Notes,

        profile: {
          name: {
            first: customer.GivenName,
            middle: customer.MiddleName,
            last: customer.FamilyName,
            display: customer.DisplayName
          },

          address: {
            billing: customer.BillAddr ? `${customer.BillAddr.Line1}, ${customer.BillAddr.City}, ${customer.BillAddr.CountrySubDivisionCode}` : undefined,
            physical: customer.ShipAddr ? `${customer.ShipAddr.Line1}, ${customer.ShipAddr.City}, ${customer.ShipAddr.CountrySubDivisionCode}` : undefined
          },

          phone: {
            primary: { number: customer.PrimaryPhone ? customer.PrimaryPhone.FreeFormNumber : undefined },
            mobile: { number: customer.Mobile ? customer.Mobile.FreeFormNumber : undefined },
            fax: { number: customer.Fax ? customer.Fax.FreeFormNumber : undefined }
          }
        }
      }

      // For now, we need to assume that all phone numbers without country code are +1
      if (customerData.phone.primary.number && customerData.phone.primary.number !== '' && customerData.phone.primary.number.charAt(0) === '+') customerData.phone.primary.number = `+1-${customerData.phone.primary.number}`
      if (customerData.phone.mobile.number && customerData.phone.mobile.number !== '' && customerData.phone.mobile.number.charAt(0) === '+') customerData.phone.mobile.number = `+1-${customerData.phone.mobile.number}`
      if (customerData.phone.fax.number && customerData.phone.fax.number && customerData.phone.fax.number.charAt(0) === '+') customerData.phone.fax.number = `+1-${customerData.phone.fax.number}`

      if (customer.CompanyName) {
        customerData.profile.company = {
          isCompany: true,
          name: customer.CompanyName,
          taxExempt: !customer.Taxable
        }
      }

      customerData.quickbooksID = customer.Id
      customerData.quickbooksSyncToken = parseInt(customer.SyncToken)
      customerData.quickbooksData = JSON.stringify(customer)
      customerData.hash = crypto.createHash('sha256').update(JSON.stringify(customerData)).digest('hex')

      downloadCustomers.push(customerData)
      uploadCustomers = uploadCustomers.filter(c => c.quickbooksID === customer.quickbooksID)
      qbCustomers = qbCustomers.filter(c => c.quickbooksID === customer.quickbooksID)
    }))

    // Find local records to be updated
    await Promise.all(downloadCustomers.map(async customer => {
      const { data } = await this.app.service('customers').find({ query: { quickbooksID: customer.quickbooksID, $limit: 1 } })
      const local = data[0]
      updateCustomers = []

      if (local) {
        downloadCustomers = downloadCustomers.filter(c => c.quickbooksID === customer.quickbooksID)
        const needsUpdate = local.hash !== customer.hash
        if (needsUpdate) this.logger.verbose('[QBO:SyncCustomers', { metadata: { id: local.uuid, needsUpdate } })
        if (needsUpdate) updateCustomers.push({ id: local.uuid, data: customer })
      }
    }))

    // Insert new customers
    try {
      downloaded = downloadCustomers.length
      this.logger.verbose('[QBO:SyncCustomers]', { metadata: `inserting ${downloaded} customers` })
      if (downloadCustomers.length > 0) await this.app.service('customers').create(downloadCustomers)
    } catch (error) {
      this.logger.error('Sync Error inserting customers', error)
      return { error }
    }

    // Update existing customers
    try {
      updated = updateCustomers.length
      this.logger.verbose('[QBO:SyncCustomers]', { metadata: `updating ${updated} customers` })
      await Promise.all(updateCustomers.map(async customer => {
        return await this.app.service('customers').patch(customer.id, customer.data)
      }))
    } catch (error) {
      this.logger.error('Sync Error updating customers', error)
      return { error }
    }

    // Send local customers to Quickbooks
    try {
      uploaded = uploadCustomers.length
      this.logger.verbose('[QBO:SyncCustomers]', { metadata: `uploading ${uploaded} customers` })
      const result = await Promise.all(uploadCustomers.map(async customer => {
        this.logger.debug('Uploading new customer to QB')
        return await this.create({ type: 'customer', customer })
      }))

      return { error: false, downloaded, uploaded, updated, result }
    } catch (error) {
      this.logger.error('Sync Error sending local customers', error)
      return { error }
    }
  }

  async patch (id, data, params) {
    switch (id) {
      case 'customers':
        return await this.syncCustomers()
      default:
        return false
    }
  }

  async update (id, data, params) {
    const customer = await this.app.service('customers').get(id)
    const qbCustomer = await this.convertCustomerToQuickbooks(customer)
    qbCustomer.Id = customer.quickbooksID
    qbCustomer.sparse = true
    qbCustomer.SyncToken = String(customer.quickbooksSyncToken)

    // const { response } = await this.api({ action: 'customer', urlParams: customer.quickbooksID })
    // console.log(response)

    const { error, response } = await this.api({
      method: 'POST',
      action: 'customer',
      body: qbCustomer
    })

    if (!response || error) return { error, response }

    await this.app.service('customers').patch(id, { quickbooksSyncToken: parseInt(response.Customer.SyncToken) })

    return { error, response }
  }

  async create (data, params) {
    const createCustomer = async customer => {
      try {
        const qbCustomer = await this.convertCustomerToQuickbooks(customer)

        try {
          const newCustomer = (await this.api({ action: 'customer', method: 'POST', body: qbCustomer }))
          if (!newCustomer || newCustomer.error) throw new BadRequest('Quickbooks API Error', newCustomer.error)
          const hash = crypto.createHash('sha256').update(JSON.stringify(newCustomer.response)).digest('hex')
          this.app.service('customers').patch(customer.uuid, { quickbooksID: newCustomer.response.Customer.Id, quickbooksData: JSON.stringify(newCustomer.response.Customer), hash })
          return true
        } catch (err) {
          this.logger.error('[QBO:SyncCustomers]', { metadata: { err } })
          return false
        }
      } catch (err) {
        this.logger.error(err)
        return false
      }
    }

    switch (data.type) {
      case 'customer':
        return await createCustomer(data.customer)
      default:
        return false
    }
  }
}
