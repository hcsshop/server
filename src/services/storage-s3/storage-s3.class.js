const AWS = require('aws-sdk')
const s3blobs = require('s3-blob-store')
const BlobService = require('feathers-blob')

exports.StorageS3 = class StorageS3 {
  constructor (options, app) {
    this.options = options || {}
    this.logger = app.get('logger')

    process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || this.options.storage.accessKeyId
    process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || this.options.storage.secretAccessKey

    this.client = new AWS.S3()
    this.blobStore = s3blobs({
      client: this.client,
      bucket: this.options.storage.bucketName || 'ors-storage-dev'
    })

    this.blobService = BlobService({
      id: 'ors-blob',
      Model: this.blobStore
    })
  }

  async find (params) {
    return []
  }

  async get (id, params) {
    return await this.blobService.get(id, params)
  }

  async create (data, params) {
    if (Array.isArray(data)) return Promise.all(data.map(current => this.create(current, params)))
    const result = await this.blobService.create({ id: data.id, uri: data.file })
    return result
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    return { id }
  }
}
