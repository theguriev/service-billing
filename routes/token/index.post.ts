const requestBodySchema = z.object({
  name: z.string().min(3).max(50),
  symbol: z.string().min(1).max(3),
  wallet: z.string(),
  emission: z.number().int().min(1).max(1000000000)
})

export default eventHandler(async (event) => {
  const {
    name,
    symbol,
    wallet,
    emission
  } = await zodValidateBody(event, requestBodySchema.parse)
  const author = await getUserId(event)
  const exist = await ModelToken.findOne({ symbol })
  if (exist) {
    throw createError({ message: 'Token already exists! Symbol should be unique!', status: 409 })
  }
  const doc = new ModelToken({ name, timestamp: Date.now(), author, symbol })
  const saved = await doc.save()
  const { genesisWallet: from } = useRuntimeConfig()
  const genesisTransaction = new ModelTransaction({
    from,
    to: wallet,
    symbol,
    timestamp: Date.now(),
    message: `Emission ${emission}`,
    value: emission
  })
  await genesisTransaction.save()
  return saved.toJSON()
})
