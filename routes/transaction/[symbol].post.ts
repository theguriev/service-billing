import { verifyMessage } from 'ethers'

const verifySignature = (payload: string, signature: string, publicKey: string) => {
  try {
    // Recover the signer's address from the signature and message
    const recoveredAddress = verifyMessage(payload, signature)

    // Check if the recovered address matches the provided public key
    if (recoveredAddress.toLowerCase() === publicKey.toLowerCase()) {
      return true // Signature is valid
    } else {
      return false // Signature is invalid
    }
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false // Signature verification failed
  }
}

const requestBodySchema = z.object({
  from: z.string(),
  to: z.string(),
  value: z.number().int().min(1),
  signature: z.string(),
  message: z.string().optional()
})

export default eventHandler(async (event) => {
  const symbol = getRouterParam(event, 'symbol')!
  const {
    from,
    to,
    signature,
    value,
    message
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
