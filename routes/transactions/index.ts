export default eventHandler((event) => {
  const {
    limit = 10,
    offset = 0,
    orderBy = 'timestamp',
    order = 'desc',
    symbol = '',
    address = '',
    from = '',
    to = ''
  } = getQuery(event)

  const query: any = {
    ...(symbol ? { symbol } : {}),
    ...(address ? { $or: [{ to: address }, { from: address }] } : {})
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
