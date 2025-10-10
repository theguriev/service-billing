import type { InferSchemaType } from 'mongoose'
import transactionSchema from '../db/schema/transaction'

// Выводим тип из схемы Mongoose автоматически включая idempotencyKey
export type TransactionType = InferSchemaType<typeof transactionSchema>

// Тип для работы только с необходимыми полями
export type TransactionData = Pick<TransactionType, 'symbol' | 'value' | 'to' | 'from'>

// Расширенный тип транзакции включающий Mongoose поля
export type TransactionDocument = TransactionType & {
  _id?: string
  __v?: number
}
