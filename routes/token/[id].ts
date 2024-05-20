export default eventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')
  const found = await ModelToken.findOne({ _id })
  return found?.toJSON()
})
