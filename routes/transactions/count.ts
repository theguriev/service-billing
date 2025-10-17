export default eventHandler(async (event) => {
  const {
    fromTimestamp,
    toTimestamp,
    value,
    symbol,
    from,
    to,
    address
  } = getQuery(event)

  try {
    // Строим запрос для подсчета
    const query: any = {}

    // Временной диапазон
    if (fromTimestamp || toTimestamp) {
      query.timestamp = {}
      if (fromTimestamp) {
        query.timestamp.$gte = Number(fromTimestamp)
      }
      if (toTimestamp) {
        query.timestamp.$lte = Number(toTimestamp)
      }
    }

    // Фильтр по value
    if (value !== undefined) {
      query.value = Number(value)
    }

    // Фильтр по символу
    if (symbol) {
      query.symbol = String(symbol)
    }

    // Фильтры по адресам
    if (address) {
      // Если указан общий адрес, ищем его как отправителя или получателя
      query.$or = [{ from: String(address) }, { to: String(address) }]
    } else {
      // Если указаны конкретные from/to, используем их
      if (from) {
        query.from = String(from)
      }
      if (to) {
        query.to = String(to)
      }
    }

    // Выполняем подсчет
    const count = await ModelTransaction.countDocuments(query)

    return {
      count
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to count transactions',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
