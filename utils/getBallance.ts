const sumBySymbol = (transactions: Array<{ symbol: string, value: number }>): Record<string, number> => {
  return transactions.reduce((acc, cur) => {
    const symbol = cur.symbol
    const value = cur.value
    const sum = (acc[symbol] || 0) + value
    return {
      ...acc,
      [symbol]: sum
    }
  }, {} as Record<string, number>)
}

const getBallance = async (key: string) => {
  const income = await ModelTransaction.find({ to: key })
  const incomeBySymbol = sumBySymbol(income as Array<{ symbol: string, value: number }>)

  const outcome = await ModelTransaction.find({ from: key })
  const outcomeBySymbol = sumBySymbol(outcome as Array<{ symbol: string, value: number }>)

  const ballanceBySymbol = Object.keys(incomeBySymbol).reduce((acc, symbol) => {
    const income = incomeBySymbol[symbol]
    const outcome = outcomeBySymbol[symbol] || 0
    const ballance = income - outcome
    return {
      ...acc,
      [symbol]: ballance
    }
  }, {} as Record<string, number>)

  return {
    income,
    incomeBySymbol,
    outcome,
    outcomeBySymbol,
    ballanceBySymbol
  }
}

export default getBallance
