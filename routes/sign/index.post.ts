import { Wallet } from 'ethers'

const requestBodySchema = z.object({
  privateKey: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.number().int().min(1),
  symbol: z.string()
})

export default eventHandler(async (event) => {
  const {
    privateKey,
    from,
    to,
    value,
    symbol
  } = await zodValidateBody(event, requestBodySchema.parse)
  const wallet = new Wallet(privateKey)
  return wallet.signMessage(JSON.stringify({ from, to, value, symbol }))
})
