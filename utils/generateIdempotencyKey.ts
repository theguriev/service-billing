import { createHash } from 'crypto'

export function generateIdempotencyKey (transaction: {
  from: string
  to: string
  value: number
  symbol: string
  message?: string
}): string {
  // Создаем детерминированный ключ на основе содержимого транзакции
  const content = JSON.stringify({
    from: transaction.from,
    to: transaction.to,
    value: transaction.value,
    symbol: transaction.symbol,
    message: transaction.message || ''
  })

  return createHash('sha256').update(content).digest('hex').substring(0, 32)
}

export function generateIdempotencyKeyFromSignature (signatureData: string, signature: string): string {
  // Генерируем ключ на основе подписи - более безопасный способ
  const content = `${signatureData}:${signature}`
  return createHash('sha256').update(content).digest('hex').substring(0, 32)
}
