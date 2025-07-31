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

  let basicStats = {
    totalTransactions: 0,
    totalValue: 0,
    avgValue: 0,
    uniqueSendersCount: 0,
    uniqueReceiversCount: 0,
    symbolsCount: 0,
    symbols: []
  }

  if (result.length > 0) {
    basicStats = result[0]
  }

  // Если указан адрес, добавляем детальную статистику по отправленным/полученным
  if (address) {
    // Статистика по отправленным транзакциям
    const sentPipeline: any[] = [
      { $match: { from: address, ...(symbol ? { symbol } : {}) } },
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]

    // Статистика по полученным транзакциям
    const receivedPipeline: any[] = [
      { $match: { to: address, ...(symbol ? { symbol } : {}) } },
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]

    const [sentStats, receivedStats] = await Promise.all([
      ModelTransaction.aggregate(sentPipeline),
      ModelTransaction.aggregate(receivedPipeline)
    ])

    return {
      ...basicStats,
      sent: {
        bySymbol: sentStats,
        totalTransactions: sentStats.reduce((sum, stat) => sum + stat.count, 0),
        totalValue: sentStats.reduce((sum, stat) => sum + stat.totalValue, 0)
      },
      received: {
        bySymbol: receivedStats,
        totalTransactions: receivedStats.reduce((sum, stat) => sum + stat.count, 0),
        totalValue: receivedStats.reduce((sum, stat) => sum + stat.totalValue, 0)
      }
    }
  }

  return basicStats
})
