const { Service } = require('feathers-mongoose')

exports.Storage = class Storage extends Service {
  constructor (options, app) {
    super(options, app)
    this.logger = app.get('logger')
    this.app = app

    this.defaultStorageType = process.env.DEFAULT_FILE_STORAGE_TYPE || this.options.storage.general.defaultStorageType || 'super'
    this.folderKeyPrefix = process.env.DEFAULT_FILE_STORAGE_FOLDER_PREFIX || this.options.storage.general.folderKeyPrefix || ''

    this.createS3 = async ({ id, datauri }) => {
      const result = await this.app.service('storage-s3').create({ id, file: datauri })
      return result
    }
  }

  async create (data, params) {
    const { storageType, folder = '/', filename = Math.random().toString(36).split('.')[1], related, file } = data
    const fileType = file.split(';')[0].split(':')[1]
    const path = folder === '/' ? this.folderKeyPrefix : `${this.folderKeyPrefix}${folder.replace(/^\//, '')}`

    let result // eslint-disable-line

    switch (storageType || this.defaultStorageType) {
      case 'super':
        return await super.create({
          fileType,
          storageType,
          folder,
          filename,
          related,
          datauri: file
        })

      case 's3':
        result = await super.create({
          fileType,
          storageType,
          folder,
          filename,
          related,
          keys: { s3: (await this.createS3({ datauri: file, id: `${path}${filename}` }))['ors-blob'] }
        })

        result.url = `https://${this.options.storage.s3.bucketName}.s3.amazonaws.com/${result.keys.s3}`
        return result

      default:
        return new Error('Invalid storage type')
    }
  }

  async update (id, data, params) {
    params.mongoose = { upsert: true }
    return await super.update(id, data, params)
  }

  async get (id, params) {
    const { storageType = this.defaultStorageType } = params.query
    console.log({ query: params.query })
    const result = await super.get(id, params)

    switch (storageType) {
      case 's3':
        result.data = await this.app.service('storage-s3').get(result.keys.s3)
    }

    return result
  }
}
