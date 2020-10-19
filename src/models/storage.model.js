const { v4: uuidv4 } = require('uuid')

module.exports = function (app) {
  const modelName = 'storage'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    folder: { type: String, index: true, unique: false, sparse: true, default: '/' },
    filename: { type: String },
    fileType: { type: String },
    storageType: { type: String },
    datauri: { type: String },

    keys: {
      s3: { type: String }
    },

    related: {
      customer: { type: String },
      machine: { type: String },
      appointment: { type: String },
      order: { type: String }
    }
  }, {
    timestamps: true
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
