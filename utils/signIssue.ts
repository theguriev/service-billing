import { Wallet } from 'ethers'

const signIssue = (privateKey: string, address: string, emission: number, symbol: string) => {
  const wallet = new Wallet(privateKey)
  return wallet.signMessage(JSON.stringify({ symbol, address, emission }))
}

export default signIssue
