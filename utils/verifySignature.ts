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

export default verifySignature
