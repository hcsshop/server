const { v4: uuidv4 } = require('uuid')

module.exports = function (app) {
  const modelName = 'orders'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    customer: { type: String, index: true, unique: false, sparse: true },
    machines: [{ type: String }],
    status: { type: String, default: 'pending' },
    accessories: [{ type: String }],
    description: { type: String },
    notes: { type: String },

    related: {
      appointment: { type: String }
    },

    intakeConditions: [{
      machine: { type: String },
      value: { type: Number }
    }],

    intakeDescriptions: [{
      machine: { type: String },
      value: { type: String }
    }],

    intakePasswords: [{
      machine: { type: String },
      value: { type: String }
    }],

    intakePhotos: [{
      machine: { type: String },
      value: { type: String }
    }],

    outputPhotos: [{
      machine: { type: String },
      value: { type: String }
    }],

    outputConditions: [{
      machine: { type: String },
      value: { type: Number }
    }],

    outputDescriptions: [{
      machine: { type: String },
      value: { type: String }
    }],

    parts: [{
      uuid: { type: String, default: uuidv4 },
      name: { type: String, required: true },
      machine: { type: String },
      category: { type: String },
      description: { type: String },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      approved: { type: Boolean, default: false }
    }],

    events: [{
      uuid: { type: String, default: uuidv4 },
      user: { type: String },
      type: { type: String },
      start: { type: Date, default: Date.now },
      end: { type: Date, default: Date.now },
      timerData: {
        duration: Number,
        hours: Number,
        minutes: Number,
        seconds: Number
      },
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
