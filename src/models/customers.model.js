const { v4: uuidv4 } = require('uuid')

module.exports = function (app) {
  const modelName = 'customers'
  const mongooseClient = app.get('mongooseClient')

  const schema = new mongooseClient.Schema({
    uuid: { type: String, index: true, unique: true, default: uuidv4 },
    hash: { type: String, unique: true, sparse: true },
    email: { type: String, lowercase: true },

    timestamps: {
      lastLogin: Date,
      lastService: Date,
      customerSince: { type: Date, default: Date.now }
    },

    profile: {
      name: {
        first: String,
        middle: String,
        last: String,
        display: { type: String, required: true, unique: true }
      },

      address: {
        coordinates: {
          latitude: Number,
          longitude: Number,
          accuracy: Number,
          timestamp: Number
        },

        billing: String,
        physical: String,
        physicalSameAsBilling: { type: Boolean, default: true }
      },

      company: {
        isCompany: { type: Boolean, default: false },
        name: String,
        taxId: String,
        taxExempt: Boolean,
        contact: String,
        email: String,
        website: String
      },

      phone: {
        primary: {
          number: { type: String, default: '' },
          extension: String
        },

        mobile: {
          number: String,
          carrier: String
        },

        fax: {
          number: String,
          extension: String
        }
      },

      photo: Buffer,
      data: {}
    },

    notes: String,
    attachments: [{
      name: String,
      time: { type: Date, default: Date.now },
      url: String,
      data: Buffer
    }],

    quickbooksID: { type: String, unique: true, index: true, sparse: true },
    quickbooksSyncToken: { type: Number, default: 0 },
    quickbooksData: String
  }, {
    timestamps: true
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) mongooseClient.deleteModel(modelName)
  return mongooseClient.model(modelName, schema)
}
