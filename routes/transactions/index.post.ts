const requestBodySchema = z.object({
  from: z.string(),
  to: z.string(),
  value: z.number().min(1),
  signature: z.string(),
  message: z.string().optional(),
  symbol: z.string().min(1).max(3)
})

export default eventHandler(async (event) => {
  const {
    from,
    to,
    signature,
    value,
    message,
    symbol
  } = await zodValidateBody(event, requestBodySchema.parse)
  const verify = verifySignature(JSON.stringify({ from, to, value, symbol }), signature, from)
  if (!verify) {
    throw createError({ message: 'Invalid signature!', status: 400 })
  }
  const { ballanceBySymbol } = await getBallance(from)
  if (!(symbol in ballanceBySymbol) || ballanceBySymbol[symbol] < value) {
    throw createError({ message: 'Insufficient funds!', status: 400 })
  }
  const doc = new ModelTransaction({ from, to, symbol, timestamp: Date.now(), message, value })
  const saved = await doc.save()
  return saved.toJSON()
})
