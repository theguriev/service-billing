export default eventHandler(async (event) => {
  const { symbol, address } = getQuery(event)

  const matchFilter: any = {}

  if (symbol) {
    matchFilter.symbol = symbol
  }

  if (address) {
    matchFilter.$or = [{ from: address }, { to: address }]
  }

  // Простая агрегация для быстрого отображения основных метрик
  const pipeline: any[] = [
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalValue: { $sum: '$value' },
        avgValue: { $avg: '$value' },
        uniqueSenders: { $addToSet: '$from' },
        uniqueReceivers: { $addToSet: '$to' },
        symbols: { $addToSet: '$symbol' }
      }
    },
    {
      $project: {
        _id: 0,
        totalTransactions: 1,
        totalValue: 1,
        avgValue: { $round: ['$avgValue', 2] },
        uniqueSendersCount: { $size: '$uniqueSenders' },
        uniqueReceiversCount: { $size: '$uniqueReceivers' },
        symbolsCount: { $size: '$symbols' },
        symbols: 1
      }
    }
  ]

  const result = await ModelTransaction.aggregate(pipeline)

  if (result.length === 0) {
    return {
      totalTransactions: 0,
      totalValue: 0,
      avgValue: 0,
      uniqueSendersCount: 0,
      uniqueReceiversCount: 0,
      symbolsCount: 0,
      symbols: []
    }
  }

  return result[0]
})
