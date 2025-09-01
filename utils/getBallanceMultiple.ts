import type { TransactionData } from '../types/transaction'

// Типы для результата
type AddressBalanceResult = {
  address: string
  ballanceBySymbol: Record<string, number>
  incomeTransactionCount: number
  outcomeTransactionCount: number
}

// Функция для суммирования по символам с учетом nullable полей
const sumBySymbol = (transactions: TransactionData[]): Record<string, number> => {
  return transactions
    .filter((t): t is TransactionData & { symbol: string; value: number } =>
      t.symbol != null && t.value != null
    )
    .reduce((acc, cur) => ({
      ...acc,
      [cur.symbol]: (acc[cur.symbol] || 0) + cur.value
    }), {} as Record<string, number>)
}

// Функция для группировки транзакций по адресам (без мутаций)
const groupTransactionsByAddress = (
  transactions: TransactionData[],
  addressField: 'to' | 'from'
): Record<string, TransactionData[]> => {
  return transactions
    .filter(transaction => transaction[addressField])
    .reduce((acc, transaction) => {
      const address = transaction[addressField]!
      return {
        ...acc,
        [address]: [...(acc[address] || []), transaction]
      }
    }, {} as Record<string, TransactionData[]>)
}

// Функция для вычисления баланса одного адреса
const calculateAddressBalance = (
  address: string,
  incomeTransactions: TransactionData[],
  outcomeTransactions: TransactionData[]
): AddressBalanceResult => {
  const incomeBySymbol = sumBySymbol(incomeTransactions)
  const outcomeBySymbol = sumBySymbol(outcomeTransactions)

  // Получаем все уникальные символы из входящих и исходящих транзакций
  const allSymbols = new Set([
    ...Object.keys(incomeBySymbol),
    ...Object.keys(outcomeBySymbol)
  ])

  const ballanceBySymbol = Array.from(allSymbols).reduce((acc, symbol) => ({
    ...acc,
    [symbol]: (incomeBySymbol[symbol] || 0) - (outcomeBySymbol[symbol] || 0)
  }), {} as Record<string, number>)

  return {
    address,
    ballanceBySymbol,
    incomeTransactionCount: incomeTransactions.length,
    outcomeTransactionCount: outcomeTransactions.length
  }
}

// Основная функция
const getBallanceMultiple = async (addresses: string[]): Promise<AddressBalanceResult[]> => {
  // Параллельное выполнение запросов к БД
  const [incomeTransactions, outcomeTransactions] = await Promise.all([
    ModelTransaction.find({ to: { $in: addresses } }).lean(),
    ModelTransaction.find({ from: { $in: addresses } }).lean()
  ])

  // Группируем транзакции по адресам функционально
  const incomeByAddress = groupTransactionsByAddress(
    incomeTransactions as TransactionData[],
    'to'
  )
  const outcomeByAddress = groupTransactionsByAddress(
    outcomeTransactions as TransactionData[],
    'from'
  )

  // Вычисляем балансы для всех адресов функционально
  return addresses.map(address =>
    calculateAddressBalance(
      address,
      incomeByAddress[address] || [],
      outcomeByAddress[address] || []
    )
  )
}

export default getBallanceMultiple
