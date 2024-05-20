export default eventHandler((event) => {
  const { limit = 10, offset = 0, orderBy = 'timestamp', order = 'desc' } = getQuery(event)
  return ModelToken.find().sort({ [String(orderBy)]: order === 'asc' ? 1 : -1 }).limit(Number(limit)).skip(Number(offset))
})
