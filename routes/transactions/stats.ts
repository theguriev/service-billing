export default eventHandler(async (event) => {
  const {
    from: dateFrom,
    to: dateTo,
    symbol,
    address,
    limit = 10
  } = getQuery(event)

  // Базовый фильтр
  const matchFilter: any = {}

  // Фильтр по временному периоду
  if (dateFrom || dateTo) {
    matchFilter.timestamp = {}
    if (dateFrom) {
      matchFilter.timestamp.$gte = Number(dateFrom)
    }
    if (dateTo) {
      matchFilter.timestamp.$lte = Number(dateTo)
    }
  }

  // Фильтр по символу
  if (symbol) {
    matchFilter.symbol = symbol
  }

  // Фильтр по адресу (from или to)
  if (address) {
    matchFilter.$or = [{ from: address }, { to: address }]
  }

  // Агрегация для получения статистики
  const pipeline: any[] = [
    { $match: matchFilter },
    {
      $facet: {
        // Общая статистика
        totalStats: [
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalValue: { $sum: '$value' },
              avgValue: { $avg: '$value' },
              minValue: { $min: '$value' },
              maxValue: { $max: '$value' }
            }
          }
        ],

        // Статистика по символам
        statsBySymbol: [
          {
            $group: {
              _id: '$symbol',
              count: { $sum: 1 },
              totalValue: { $sum: '$value' },
              avgValue: { $avg: '$value' }
            }
          },
          { $sort: { totalValue: -1 } }
        ],

        // Топ отправителей
        topSenders: [
          {
            $group: {
              _id: '$from',
              count: { $sum: 1 },
              totalSent: { $sum: '$value' }
            }
          },
          { $sort: { totalSent: -1 } },
          { $limit: Number(limit) }
        ],

        // Топ получателей
        topReceivers: [
          {
            $group: {
              _id: '$to',
              count: { $sum: 1 },
              totalReceived: { $sum: '$value' }
            }
          },
          { $sort: { totalReceived: -1 } },
          { $limit: Number(limit) }
        ],

        // Статистика по времени (группировка по дням)
        dailyStats: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: { $toDate: '$timestamp' }
                }
              },
              count: { $sum: 1 },
              totalValue: { $sum: '$value' }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 30 } // Последние 30 дней
        ]
      }
    }
  ]

  const result = await ModelTransaction.aggregate(pipeline)
  const stats = result[0]

  const basicStats = {
    total: stats.totalStats[0] || {
      totalTransactions: 0,
      totalValue: 0,
      avgValue: 0,
      minValue: 0,
      maxValue: 0
    },
    bySymbol: stats.statsBySymbol,
    topSenders: stats.topSenders,
    topReceivers: stats.topReceivers,
    daily: stats.dailyStats,
    filters: {
      dateFrom,
      dateTo,
      symbol,
      address,
      limit
    }
  }

  // Если указан адрес, добавляем детальную статистику по отправленным/полученным
  if (address) {
    // Базовый фильтр для детальной статистики
    const detailFilter: any = {}
    if (dateFrom || dateTo) {
      detailFilter.timestamp = {}
      if (dateFrom) {
        detailFilter.timestamp.$gte = Number(dateFrom)
      }
      if (dateTo) {
        detailFilter.timestamp.$lte = Number(dateTo)
      }
    }
    if (symbol) {
      detailFilter.symbol = symbol
    }

    // Статистика по отправленным транзакциям
    const sentPipeline: any[] = [
      { $match: { from: address, ...detailFilter } },
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
      { $match: { to: address, ...detailFilter } },
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
