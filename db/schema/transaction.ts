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

// Добавляем индексы для оптимизации запросов баланса
transactionSchema.index({ to: 1, symbol: 1 }) // Для входящих транзакций
transactionSchema.index({ from: 1, symbol: 1 }) // Для исходящих транзакций
transactionSchema.index({ to: 1 }) // Дополнительный индекс для быстрого поиска по адресу получателя
transactionSchema.index({ from: 1 }) // Дополнительный индекс для быстрого поиска по адресу отправителя

export default transactionSchema
