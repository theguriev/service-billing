import { Schema } from 'mongoose'

const streamSchema = new Schema({
  name: String,
  timestamp: Number,
  author: String,
  sources: [
    {
      _id: String,
      type: {
        type: String,
        enum: ['instagram', 'facebook', 'x', 'youtube']
      },
      meta: Object,
      options: Object
    }]
})

export default streamSchema
