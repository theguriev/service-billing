const requestBodySchema = z.object({
  addresses: z.array(z.string().min(1)).min(1).max(100) // Ограничиваем максимум 100 адресов
})

export default eventHandler(async (event) => {
  const { addresses } = await zodValidateBody(event, requestBodySchema.parse)

  try {
    const results = await checkAddressesActivity(addresses)
    return results
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check addresses activity',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
