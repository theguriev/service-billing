const issue = ({ address, symbol, emission }: { address: string; symbol: string; emission: number }) => {
  const { genesisaddress: from } = useRuntimeConfig()
  const genesisTransaction = new ModelTransaction({
    from,
    to: address,
    symbol,
    timestamp: Date.now(),
    message: `Emission ${emission}`,
    value: emission
  })
  return genesisTransaction.save()
}
export default issue
