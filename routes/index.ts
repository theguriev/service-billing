export default eventHandler(async (event) => {
  const author = await getUserId(event)
  const walls = await ModelStreams.find({ author })
  return walls
})
