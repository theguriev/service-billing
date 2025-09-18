export default eventHandler((event) => {
  const {
    limit = 10,
    offset = 0,
    orderBy = 'timestamp',
    order = 'desc',
    symbol = '',
    address = '',
    fromAddress = '',
    toAddress = '',
    from = '',
    to = ''
  } = getQuery(event)

  const query: any = {
    ...(symbol ? { symbol } : {})
  }

  // Фильтры по адресам
  if (address) {
    query.$or = [{ to: address }, { from: address }]
  } else {
    // Если нет общего address, проверяем отдельные fromAddress и toAddress
    if (fromAddress) {
      query.from = fromAddress
    }
    if (toAddress) {
      query.to = toAddress
    }
  }

  // Фильтр по временному периоду
  if (from || to) {
    query.timestamp = {}
    if (from) {
      query.timestamp.$gte = Number(from)
    }
    if (to) {
      query.timestamp.$lte = Number(to)
    }
  }

  return ModelTransaction.find(query).sort({ [String(orderBy)]: order === 'asc' ? 1 : -1 }).limit(Number(limit)).skip(Number(offset))
})
