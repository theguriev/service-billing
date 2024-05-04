import { Wallet } from 'ethers'

const signTransaction = (privateKey: string, from: string, to: string, value: number, symbol: string) => {
  const wallet = new Wallet(privateKey)
  return wallet.signMessage(JSON.stringify({ from, to, value, symbol }))
}

export default signTransaction
