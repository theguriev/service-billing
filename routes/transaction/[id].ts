export default eventHandler(async (event) => {
  const _id = getRouterParam(event, 'id')
  const all = await ModelTransaction.findById(_id)
  return all?.toJSON()
})
