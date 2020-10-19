const { v4: uuidv4 } = require('uuid')

module.exports = function (app) {
  const modelName = 'machines'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    customer: { type: String, index: true, unique: false, sparse: true },

    manufacturer: { type: String },
    model: { type: String },
    serial: { type: String },

    intakePhotos: [String],
    outputPhotos: [String],

    financials: {
      qbEstimate: { type: Number },
      qbInvoice: { type: Number }
    },

    events: [{
      uuid: { type: String, default: uuidv4 },
      user: { type: String },
      type: { type: String },
      stamp: { type: Date, default: Date.now },
      title: { type: String },
      message: { type: String }
    }]
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
