export default eventHandler(async (event) => {
  const author = await getUserId(event)
  const _id = getRouterParam(event, 'id')
  if (!isValidObjectId(_id)) {
    throw createError({ message: 'Invalid id!', status: 409 })
  }
  const exist = await ModelStreams.findOne({
    _id,
    author
  }).exec()
  if (exist === null) {
    throw createError({ message: 'Stream not exists!', status: 409 })
  }

  return exist.toJSON()
})
