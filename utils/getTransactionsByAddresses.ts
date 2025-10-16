export interface GetTransactionsByAddressesOptions {
  addresses: string[]
  value?: number
  fromTimestamp?: number
  toTimestamp?: number
  symbol?: string
  limit?: number
  offset?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

export async function getTransactionsByAddresses (options: GetTransactionsByAddressesOptions) {
  const {
    addresses,
    value,
    fromTimestamp,
    toTimestamp,
    symbol,
    limit = 1000,
    offset = 0,
    orderBy = 'timestamp',
    order = 'desc'
  } = options

  // Строим базовый запрос - ищем транзакции где адрес является отправителем или получателем
  const query: any = {
    $or: [
      { from: { $in: addresses } },
      { to: { $in: addresses } }
    ]
  }

  // Добавляем фильтры
  if (value !== undefined) {
    query.value = value
  }

  if (symbol) {
    query.symbol = symbol
  }

  if (fromTimestamp || toTimestamp) {
    query.timestamp = {}
    if (fromTimestamp) {
      query.timestamp.$gte = fromTimestamp
    }
    if (toTimestamp) {
      query.timestamp.$lte = toTimestamp
    }
  }

  // Выполняем запрос
  const transactions = await ModelTransaction
    .find(query)
    .sort({ [orderBy]: order === 'asc' ? 1 : -1 })
    .limit(limit)
    .skip(offset)
    .lean()

  // Группируем транзакции по адресам
  const result: Record<string, any[]> = {}

  // Инициализируем все адреса пустыми массивами
  for (const address of addresses) {
    result[address] = []
  }

  // Распределяем транзакции по адресам
  for (const transaction of transactions) {
    // Добавляем транзакцию к адресу отправителя, если он в списке
    if (transaction.from && addresses.includes(transaction.from)) {
      result[transaction.from].push(transaction)
    }
    
    // Добавляем транзакцию к адресу получателя, если он в списке и отличается от отправителя
    if (transaction.to && addresses.includes(transaction.to) && transaction.to !== transaction.from) {
      result[transaction.to].push(transaction)
    }
  }

  return result
}