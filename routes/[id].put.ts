const requestBodySchema = z.object({
  name: z.string().min(3).max(50),
  sources: z.array(z.object({
    _id: z.string(),
    type: z.enum(['instagram', 'facebook', 'x', 'youtube']),
    meta: z.object({}).passthrough().optional(),
    options: z.object({}).passthrough().optional()
  }))
})

export default eventHandler(async (event) => {
  const author = await getUserId(event)
  const id = getRouterParam(event, 'id')
  const {
    name,
    sources
  } = await zodValidateBody(event, requestBodySchema.parse)
  const exist = ModelStreams.findOne({
    _id: id,
    author
  })

  if (exist === null) {
    throw createError({ message: 'Stream not exists!', status: 409 })
  }

  await ModelStreams.updateOne(
    {
      _id: id
    },
    {
      $set: {
        name,
        sources
      }
    }
  )

  const updatedWall = await ModelStreams.findOne({
    _id: id
  })
  return updatedWall?.toJSON()
})
