module.exports = function (app) {
  const modelName = 'settings'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    key: { type: String, required: true, index: true, unique: true },
    title: { type: String },
    type: { type: String, default: 'boolean' },
    category: { type: String, index: true, sparse: true, unique: false, default: 'Other' },
    comment: { type: String },
    text: { type: String },
    number: { type: Number },
    enabled: { type: Boolean }
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
