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
  const {
    name,
    sources
  } = await zodValidateBody(event, requestBodySchema.parse)
  const author = await getUserId(event)
  const doc = new ModelStreams({ name, timestamp: Date.now(), author, sources })
  const saved = await doc.save()
  return saved.toJSON()
})
