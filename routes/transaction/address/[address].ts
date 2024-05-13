export default eventHandler((event) => {
  const address = getRouterParam(event, 'address')
  return ModelTransaction.find({
    $or: [{ to: address }, { from: address }]
  })
})
