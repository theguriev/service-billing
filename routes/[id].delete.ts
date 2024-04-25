export default eventHandler(async (event) => {
  const author = await getUserId(event)
  const id = getRouterParam(event, 'id')
  await ModelStreams.deleteOne({
    _id: id,
    author
  })
  const walls = await ModelStreams.find({
    author
  })
  return walls
})
