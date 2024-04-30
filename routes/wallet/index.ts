import { Wallet } from 'ethers'

export default eventHandler(() => {
  const wallet = Wallet.createRandom()
  return {
    ...wallet,
    privateKey: wallet.privateKey
  }
})
