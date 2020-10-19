const { v4: uuidv4 } = require('uuid')

module.exports = function (app) {
  const modelName = 'appointments'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    customer: { type: String, index: true, unique: false, sparse: true },
    title: { type: String, required: true },

    related: {
      order: { type: String }
    },

    description: String,
    notes: String,

    spacetime: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      location: String,
      route: {
        via: String,
        durationSeconds: Number,
        distanceMeters: Number,
        distanceMiles: Number
      }
    },

    events: [{
      type: { type: String, required: true },
      time: { type: Date, default: Date.now },
      data: String
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
