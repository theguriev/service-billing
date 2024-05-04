import { Wallet } from 'ethers'

const signToken = (privateKey: string, name: string, address: string, emission: number, symbol: string) => {
  const wallet = new Wallet(privateKey)
  return wallet.signMessage(JSON.stringify({ name, symbol, address, emission }))
}

export default signToken
