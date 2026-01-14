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
  // Используем агрегацию для оптимизированного вычисления балансов
  const aggregationResult = await ModelTransaction.aggregate([
    // Находим все транзакции, где адрес является отправителем или получателем
    {
      $match: {
        $or: [
          { to: { $in: addresses } },
          { from: { $in: addresses } }
        ],
        // Фильтруем только транзакции с валидными данными
        symbol: { $exists: true, $ne: null },
        value: { $exists: true, $ne: null }
      }
    },
    // Создаем документы для входящих и исходящих транзакций
    {
      $addFields: {
        transactions: [
          {
            $cond: [
              { $in: ['$to', addresses] },
              {
                address: '$to',
                type: 'income',
                symbol: '$symbol',
                value: '$value'
              },
              null
            ]
          },
          {
            $cond: [
              { $in: ['$from', addresses] },
              {
                address: '$from',
                type: 'outcome',
                symbol: '$symbol',
                value: '$value'
              },
              null
            ]
          }
        ]
      }
    },
    // Разворачиваем массив транзакций
    { $unwind: '$transactions' },
    // Убираем null значения
    { $match: { 'transactions': { $ne: null } } },
    // Заменяем корневой документ на transactions
    { $replaceRoot: { newRoot: '$transactions' } },
    // Группируем по адресу, типу и символу
    {
      $group: {
        _id: {
          address: '$address',
          type: '$type',
          symbol: '$symbol'
        },
        totalValue: { $sum: '$value' },
        count: { $sum: 1 }
      }
    },
    // Группируем по адресу и типу для агрегации по символам
    {
      $group: {
        _id: {
          address: '$_id.address',
          type: '$_id.type'
        },
        balanceBySymbol: {
          $push: {
            symbol: '$_id.symbol',
            value: '$totalValue'
          }
        },
        transactionCount: { $sum: '$count' }
      }
    },
    // Финальная группировка по адресу
    {
      $group: {
        _id: '$_id.address',
        data: {
          $push: {
            type: '$_id.type',
            balanceBySymbol: '$balanceBySymbol',
            transactionCount: '$transactionCount'
          }
        }
      }
    }
  ])

  // Преобразуем результат агрегации в нужный формат
  const resultMap = new Map<string, AddressBalanceResult>()
  
  // Инициализируем все адреса
  addresses.forEach(address => {
    resultMap.set(address, {
      address,
      ballanceBySymbol: {},
      incomeTransactionCount: 0,
      outcomeTransactionCount: 0
    })
  })

  // Обрабатываем результаты агрегации
  aggregationResult.forEach((item: any) => {
    const address = item._id
    const result = resultMap.get(address)!
    
    item.data.forEach((typeData: any) => {
      if (typeData.type === 'income') {
        result.incomeTransactionCount = typeData.transactionCount
        typeData.balanceBySymbol.forEach((balance: any) => {
          result.ballanceBySymbol[balance.symbol] = 
            (result.ballanceBySymbol[balance.symbol] || 0) + balance.value
        })
      } else if (typeData.type === 'outcome') {
        result.outcomeTransactionCount = typeData.transactionCount
        typeData.balanceBySymbol.forEach((balance: any) => {
          result.ballanceBySymbol[balance.symbol] = 
            (result.ballanceBySymbol[balance.symbol] || 0) - balance.value
        })
      }
    })
  })

  return Array.from(resultMap.values())
}

export default getBallanceMultiple
