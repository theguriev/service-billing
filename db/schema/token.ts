import { Schema } from 'mongoose'

const tokenSchema = new Schema({
  name: String,
  symbol: String,
  timestamp: Number,
  author: String
})

export default tokenSchema
