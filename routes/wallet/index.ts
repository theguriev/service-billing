import { Wallet } from 'ethers'

export default eventHandler(() => {
  const wallet = Wallet.createRandom()
  return {
    privateKey: wallet.privateKey,
    address: wallet.address
  }
})
