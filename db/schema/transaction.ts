import { Schema } from 'mongoose'

const transactionSchema = new Schema({
  from: String,
  to: String,
  symbol: String,
  timestamp: Number,
  message: String,
  value: Number,
  signature: String,
  // Добавляем idempotency key для предотвращения дубликатов
  idempotencyKey: {
    type: String,
    required: false, // Опциональный для обратной совместимости
    unique: true, // Уникальный когда присутствует
    sparse: true // Индекс только для документов где поле существует
  }
})

export default transactionSchema
