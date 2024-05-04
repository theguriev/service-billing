export default eventHandler(async (event) => {
  const symbol = getRouterParam(event, 'symbol')
  const found = await ModelToken.findOne({ symbol })
  return found?.toJSON()
})
