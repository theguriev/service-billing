const requestBodySchema = z.object({
  addresses: z.array(z.string().min(1)).min(1).max(100)
})

export default eventHandler(async (event) => {
  const { addresses } = await zodValidateBody(event, requestBodySchema.parse)

  try {
    const results = await getBallanceMultiple(addresses)

    return {
      results: results.reduce((acc, result) => ({
        ...acc,
        [result.address]: {
          address: result.address,
          ballanceBySymbol: result.ballanceBySymbol,
          success: true,
          incomeTransactionCount: result.incomeTransactionCount,
          outcomeTransactionCount: result.outcomeTransactionCount
        }
      }), {}),
      totalAddresses: addresses.length,
      successfulRequests: results.length,
      failedRequests: 0
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch balances',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
