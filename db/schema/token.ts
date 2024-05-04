import { Schema } from 'mongoose'

const tokenSchema = new Schema({
  name: String,
  description: String,
  symbol: String,
  timestamp: Number,
  address: String
})

export default tokenSchema
