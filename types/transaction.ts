import type { InferSchemaType } from 'mongoose'
import transactionSchema from '../db/schema/transaction'

// Выводим тип из схемы Mongoose
export type TransactionType = InferSchemaType<typeof transactionSchema>

// Тип для работы только с необходимыми полями
export type TransactionData = Pick<TransactionType, 'symbol' | 'value' | 'to' | 'from'>
