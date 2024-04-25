export default eventHandler(async (event) => {
  const symbol = getRouterParam(event, 'symbol')
  const all = await ModelTransaction.find({ symbol })
  return all
})
