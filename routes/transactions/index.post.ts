import { generateIdempotencyKeyFromSignature } from '~/utils/generateIdempotencyKey'

const requestBodySchema = z.object({
  from: z.string(),
  to: z.string(),
  value: z.number().min(1),
  signature: z.string(),
  message: z.string().optional(),
  symbol: z.string().min(1).max(3),
  // idempotencyKey опциональный для обратной совместимости
  idempotencyKey: z.string().min(1).max(64).optional()
})

export default eventHandler(async (event) => {
  const {
    from,
    to,
    signature,
    value,
    message,
    symbol,
    idempotencyKey: providedKey
  } = await zodValidateBody(event, requestBodySchema.parse)

  // Генерируем idempotencyKey если он не предоставлен (для обратной совместимости)
  const signatureData = JSON.stringify({ from, to, value, symbol })
  const idempotencyKey = providedKey || generateIdempotencyKeyFromSignature(signatureData, signature)

  // Проверяем, существует ли уже транзакция с таким idempotencyKey
  const existingTransaction = await ModelTransaction.findOne({ idempotencyKey })

  if (existingTransaction) {
    // Возвращаем существующую транзакцию (обеспечивает идемпотентность)
    return existingTransaction.toJSON()
  }

  const verify = verifySignature(signatureData, signature, from)
  if (!verify) {
    throw createError({ message: 'Invalid signature!', status: 400 })
  }
  const { ballanceBySymbol } = await getBallance(from)
  if (!(symbol in ballanceBySymbol) || ballanceBySymbol[symbol] < value) {
    throw createError({ message: 'Insufficient funds!', status: 400 })
  }

  try {
    const doc = new ModelTransaction({
      from,
      to,
      symbol,
      timestamp: Date.now(),
      message,
      value,
      idempotencyKey
    })
    const saved = await doc.save()
    return saved.toJSON()
  } catch (error: any) {
    // Если ошибка дубликата ключа, попробуем найти существующую транзакцию
    if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
      const existingTransaction = await ModelTransaction.findOne({ idempotencyKey })
      if (existingTransaction) {
        return existingTransaction.toJSON()
      }
    }
    throw error
  }
})
