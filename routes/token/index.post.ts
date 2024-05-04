const requestBodySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  symbol: z.string().min(1).max(3),
  address: z.string(),
  emission: z.number().int().min(1).max(10000000000),
  signature: z.string()
})

export default eventHandler(async (event) => {
  const {
    name,
    symbol,
    address,
    emission,
    description,
    signature
  } = await zodValidateBody(event, requestBodySchema.parse)
  const verify = verifySignature(JSON.stringify({
    name,
    symbol,
    address,
    emission
  }), signature, address)
  if (!verify) {
    throw createError({ message: 'Invalid signature!', status: 400 })
  }
  const exist = await ModelToken.findOne({ symbol })
  if (exist) {
    throw createError({ message: 'Token already exists! Symbol should be unique!', status: 409 })
  }
  const doc = new ModelToken({ name, description, timestamp: Date.now(), address, symbol })
  const saved = await doc.save()
  await issue({ address, symbol, emission })
  return saved.toJSON()
})
