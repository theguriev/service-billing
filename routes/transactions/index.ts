export default eventHandler((event) => {
  const { limit = 10, offset = 0, orderBy = 'timestamp', order = 'desc', symbol = '', address = '' } = getQuery(event)
  const query = {
    ...(symbol ? { symbol } : {}),
    ...(address ? { $or: [{ to: address }, { from: address }] } : {})
  }
  return ModelTransaction.find(query).sort({ [String(orderBy)]: order === 'asc' ? 1 : -1 }).limit(Number(limit)).skip(Number(offset))
})
