const requestBodySchema = z.object({
  addresses: z.array(z.string().min(1)).min(1).max(50),
  value: z.number().min(0).optional(),
  fromTimestamp: z.number().min(0).optional(),
  toTimestamp: z.number().min(0).optional(),
  symbol: z.string().min(1).max(10).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  orderBy: z.enum(['timestamp', 'value', 'symbol']).default('timestamp'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export default eventHandler(async (event) => {
  const {
    addresses,
    value,
    fromTimestamp,
    toTimestamp,
    symbol,
    limit,
    offset,
    orderBy,
    order
  } = await zodValidateBody(event, requestBodySchema.parse)

  try {
    const transactions = await getTransactionsByAddresses({
      addresses,
      value,
      fromTimestamp,
      toTimestamp,
      symbol,
      limit,
      offset,
      orderBy,
      order
    })

    // Считаем статистику
    const totalTransactions = Object.values(transactions).reduce(
      (sum: number, addressTransactions: any[]) => sum + addressTransactions.length,
      0
    )

    const addressesWithTransactions = Object.keys(transactions).filter(
      address => transactions[address].length > 0
    ).length

    return {
      transactions,
      metadata: {
        totalAddresses: addresses.length,
        addressesWithTransactions,
        totalTransactions,
        limit,
        offset,
        orderBy,
        order,
        filters: {
          value,
          fromTimestamp,
          toTimestamp,
          symbol
        }
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
  }
})
