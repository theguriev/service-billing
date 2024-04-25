import { Schema } from 'mongoose'

const transactionSchema = new Schema({
  from: String,
  to: String,
  symbol: String,
  timestamp: Number,
  message: String,
  value: Number,
  signature: String
})

export default transactionSchema
