import type { TransactionData } from '../types/transaction'

/**
 * Проверяет активность множественных адресов (есть ли у них транзакции)
 * Использует оптимизированный подход - один запрос для всех адресов
 */
const checkAddressesActivity = async (addresses: string[]): Promise<Record<string, boolean>> => {
  // Один запрос для проверки всех адресов сразу
  const transactions = await ModelTransaction.find({
    $or: [
      { to: { $in: addresses } },
      { from: { $in: addresses } }
    ]
  }, { to: 1, from: 1 }).lean() as TransactionData[]

  // Создаем Set для быстрого поиска активных адресов
  const activeAddresses = new Set<string>()

  transactions.forEach((transaction) => {
    if (transaction.to && addresses.includes(transaction.to)) {
      activeAddresses.add(transaction.to)
    }
    if (transaction.from && addresses.includes(transaction.from)) {
      activeAddresses.add(transaction.from)
    }
  })

  // Формируем результат для всех запрошенных адресов
  return addresses.reduce((result, address) => ({
    ...result,
    [address]: activeAddresses.has(address)
  }), {} as Record<string, boolean>)
}

export default checkAddressesActivity
