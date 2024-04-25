import { Wallet } from 'ethers'

export default eventHandler(() => {
  const wallet = Wallet.createRandom()
  return {
    private: wallet.privateKey,
    public: wallet.address
  }
})
