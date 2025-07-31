describe('API', () => {
  const wallet = Wallet.createRandom()
  const wallet2 = Wallet.createRandom()
  const tokenName = 'Test Token'
  const tokenSymbol = 'TST'
  const tokenEmission = 1000
  const tokenDescription = 'Test Token Description'

  const tokenName2 = 'Test Token 2'
  const tokenSymbol2 = 'ABC'
  const tokenEmission2 = 1000
  const tokenDescription2 = 'Test Token Description 2'

  let tokenId = ''

  describe('/ballance', () => {
    it('[200] get zero ballance', async () => {
      await $fetch(`/ballance/${wallet.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(JSON.stringify(response._data)).toBe('{}')
        }
      })
    })
  })

  describe('/tokens', () => {
    it('[200] get all tokens', async () => {
      await $fetch('/tokens', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
        }
      })
    })

    it('[200] create token', async () => {
      await $fetch('/tokens', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          name: tokenName,
          symbol: tokenSymbol,
          address: wallet.address,
          emission: tokenEmission,
          description: tokenDescription,
          signature: await signToken(wallet.privateKey, tokenName, wallet.address, tokenEmission, tokenSymbol)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            address: wallet.address,
            name: tokenName,
            symbol: tokenSymbol,
            description: tokenDescription
          })
        }
      })
    })

    it('[200] token successfully added', async () => {
      await $fetch('/tokens', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          tokenId = response._data[0]._id
          expect(response._data[0]).toMatchObject({
            address: wallet.address,
            name: tokenName,
            symbol: tokenSymbol,
            description: tokenDescription,
            _id: expect.any(String)
          })
        }
      })
    })

    it('[200] issue additional emission', async () => {
      await $fetch('/tokens/issue', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          symbol: tokenSymbol,
          address: wallet.address,
          emission: 2222,
          signature: await signIssue(wallet.privateKey, wallet.address, 2222, tokenSymbol)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            to: wallet.address,
            symbol: tokenSymbol,
            value: 2222
          })
        }
      })
    })

    it('[200] create one more token', async () => {
      await $fetch('/tokens', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          name: tokenName2,
          symbol: tokenSymbol2,
          address: wallet.address,
          emission: tokenEmission2,
          description: tokenDescription2,
          signature: await signToken(wallet.privateKey, tokenName2, wallet.address, tokenEmission2, tokenSymbol2)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            address: wallet.address,
            name: tokenName2,
            symbol: tokenSymbol2,
            description: tokenDescription2
          })
        }
      })
    })

    it('[200] get all tokens DESC', async () => {
      await $fetch('/tokens', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.[0].symbol).toBe(tokenSymbol2)
        }
      })
    })

    it('[200] get all tokens order==ASC', async () => {
      await $fetch('/tokens?order=asc', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.[0].symbol).toBe(tokenSymbol)
        }
      })
    })

    it('[200] get all tokens limit==10', async () => {
      await $fetch('/tokens?limit=10', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.length).toBe(2)
        }
      })
    })

    it('[200] get all tokens limit==1', async () => {
      await $fetch('/tokens?limit=1', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.length).toBe(1)
        }
      })
    })

    it('[200] get all tokens offset==1', async () => {
      await $fetch('/tokens?offset=1', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.[0].symbol).toBe(tokenSymbol)
          expect(response._data.length).toBe(1)
        }
      })
    })

    it('[200] get token by id', async () => {
      await $fetch(`/tokens/${tokenId}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data._id).toBe(tokenId)
          expect(response._data.address).toBe(wallet.address)
        }
      })
    })
  })

  describe('/transactions', () => {
    it('[200] get all transactions', async () => {
      await $fetch('/transactions', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data?.[0].timestamp > response._data?.[1].timestamp).toBe(true)
        }
      })
    })

    it('[200] get all transactions ASC', async () => {
      await $fetch('/transactions?order=asc', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.[0].timestamp < response._data?.[1].timestamp).toBe(true)
        }
      })
    })

    it('[200] get all transactions limit==10', async () => {
      await $fetch('/transactions?limit=10', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.length <= 10).toBe(true)
        }
      })
    })

    it('[200] get all transactions limit==1', async () => {
      await $fetch('/transactions?limit=1', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.length).toBe(1)
        }
      })
    })

    it('[200] get all transactions offset==1', async () => {
      await $fetch('/transactions?offset=1', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.length).toBe(2)
        }
      })
    })

    it('[200] get all transactions by symbol', async () => {
      await $fetch(`/transactions/?symbol=${tokenSymbol}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.length).toBe(2)
        }
      })
    })

    it('[200] create transaction', async () => {
      await $fetch('/transactions', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          from: wallet.address,
          to: wallet2.address,
          value: 100.55,
          message: 'hello world',
          symbol: tokenSymbol,
          signature: await signTransaction(wallet.privateKey, wallet.address, wallet2.address, 100.55, tokenSymbol)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            from: wallet.address,
            to: wallet2.address,
            value: 100.55,
            symbol: tokenSymbol
          })
        }
      })
    })

    it('[200] create transaction to genesis', async () => {
      await $fetch('/transactions', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          from: wallet2.address,
          to: '0x',
          value: 5.55,
          message: 'hello world',
          symbol: tokenSymbol,
          signature: await signTransaction(wallet2.privateKey, wallet2.address, '0x', 5.55, tokenSymbol)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            from: wallet2.address,
            to: '0x',
            value: 5.55,
            symbol: tokenSymbol
          })
        }
      })
    })

    it('[200] get all transactions by address', async () => {
      await $fetch(`/transactions?address=${wallet2.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data?.length).toBe(2)
        }
      })
    })

    it('[200] get transactions by date range', async () => {
      const now = Date.now()
      const hourAgo = now - (60 * 60 * 1000) // 1 час назад

      await $fetch(`/transactions?from=${hourAgo}&to=${now}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          // Проверяем, что все транзакции в указанном диапазоне
          response._data.forEach((transaction: any) => {
            expect(transaction.timestamp).toBeGreaterThanOrEqual(hourAgo)
            expect(transaction.timestamp).toBeLessThanOrEqual(now)
          })
        }
      })
    })

    it('[200] get transactions from specific date', async () => {
      const hourAgo = Date.now() - (60 * 60 * 1000)

      await $fetch(`/transactions?from=${hourAgo}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          // Все транзакции должны быть после указанной даты
          response._data.forEach((transaction: any) => {
            expect(transaction.timestamp).toBeGreaterThanOrEqual(hourAgo)
          })
        }
      })
    })

    it('[200] get transactions until specific date', async () => {
      const now = Date.now()

      await $fetch(`/transactions?to=${now}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          // Все транзакции должны быть до указанной даты
          response._data.forEach((transaction: any) => {
            expect(transaction.timestamp).toBeLessThanOrEqual(now)
          })
        }
      })
    })

    it('[200] get transactions with combined filters', async () => {
      const now = Date.now()
      const hourAgo = now - (60 * 60 * 1000)

      await $fetch(`/transactions?symbol=${tokenSymbol}&address=${wallet.address}&from=${hourAgo}&to=${now}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          // Проверяем все фильтры
          response._data.forEach((transaction: any) => {
            expect(transaction.symbol).toBe(tokenSymbol)
            expect([transaction.from, transaction.to]).toContain(wallet.address)
            expect(transaction.timestamp).toBeGreaterThanOrEqual(hourAgo)
            expect(transaction.timestamp).toBeLessThanOrEqual(now)
          })
        }
      })
    })

    it('[200] get transactions summary', async () => {
      await $fetch('/transactions/summary', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            totalTransactions: expect.any(Number),
            totalValue: expect.any(Number),
            avgValue: expect.any(Number),
            uniqueSendersCount: expect.any(Number),
            uniqueReceiversCount: expect.any(Number),
            symbolsCount: expect.any(Number),
            symbols: expect.any(Array)
          })
          expect(response._data.totalTransactions).toBeGreaterThan(0)
          expect(response._data.symbolsCount).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions summary by symbol', async () => {
      await $fetch(`/transactions/summary?symbol=${tokenSymbol}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            totalTransactions: expect.any(Number),
            totalValue: expect.any(Number),
            avgValue: expect.any(Number),
            uniqueSendersCount: expect.any(Number),
            uniqueReceiversCount: expect.any(Number),
            symbolsCount: 1,
            symbols: [tokenSymbol]
          })
          expect(response._data.totalTransactions).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions stats', async () => {
      await $fetch('/transactions/stats', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            total: {
              totalTransactions: expect.any(Number),
              totalValue: expect.any(Number),
              avgValue: expect.any(Number),
              minValue: expect.any(Number),
              maxValue: expect.any(Number)
            },
            bySymbol: expect.any(Array),
            topSenders: expect.any(Array),
            topReceivers: expect.any(Array),
            daily: expect.any(Array),
            filters: expect.any(Object)
          })
          expect(response._data.total.totalTransactions).toBeGreaterThan(0)
          expect(response._data.bySymbol.length).toBeGreaterThan(0)
          expect(response._data.topSenders.length).toBeGreaterThan(0)
          expect(response._data.topReceivers.length).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions stats with symbol filter', async () => {
      await $fetch(`/transactions/stats?symbol=${tokenSymbol}&limit=5`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.filters.symbol).toBe(tokenSymbol)
          expect(response._data.filters.limit).toBe('5')
          expect(response._data.bySymbol.length).toBe(1)
          expect(response._data.bySymbol[0]._id).toBe(tokenSymbol)
          expect(response._data.topSenders.length).toBeLessThanOrEqual(5)
          expect(response._data.topReceivers.length).toBeLessThanOrEqual(5)
        }
      })
    })

    it('[200] get transactions stats with date range', async () => {
      const now = Date.now()
      const hourAgo = now - (60 * 60 * 1000) // 1 час назад

      await $fetch(`/transactions/stats?from=${hourAgo}&to=${now}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.filters.dateFrom).toBe(hourAgo.toString())
          expect(response._data.filters.dateTo).toBe(now.toString())
          expect(response._data.total.totalTransactions).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions stats with empty result', async () => {
      const futureDate = Date.now() + (24 * 60 * 60 * 1000) // завтра

      await $fetch(`/transactions/stats?from=${futureDate}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.total.totalTransactions).toBe(0)
          expect(response._data.bySymbol.length).toBe(0)
          expect(response._data.topSenders.length).toBe(0)
          expect(response._data.topReceivers.length).toBe(0)
        }
      })
    })

    it('[200] get summary with non-existent symbol', async () => {
      await $fetch('/transactions/summary?symbol=NONEXISTENT', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.totalTransactions).toBe(0)
          expect(response._data.totalValue).toBe(0)
          expect(response._data.symbolsCount).toBe(0)
          expect(response._data.symbols).toEqual([])
        }
      })
    })

    it('[200] get transactions stats with address filter', async () => {
      await $fetch(`/transactions/stats?address=${wallet.address}&limit=5`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.filters.address).toBe(wallet.address)
          expect(response._data.filters.limit).toBe('5')
          expect(response._data.total.totalTransactions).toBeGreaterThan(0)
          // Проверяем, что все транзакции связаны с указанным адресом
          expect(response._data.topSenders.length).toBeGreaterThan(0)
          expect(response._data.topReceivers.length).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions summary with address filter', async () => {
      await $fetch(`/transactions/summary?address=${wallet2.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.totalTransactions).toBeGreaterThan(0)
          expect(response._data.uniqueSendersCount).toBeGreaterThan(0)
          expect(response._data.uniqueReceiversCount).toBeGreaterThan(0)
          expect(response._data.sent).toBeDefined()
          expect(response._data.received).toBeDefined()
          expect(response._data.sent.bySymbol).toBeInstanceOf(Array)
          expect(response._data.received.bySymbol).toBeInstanceOf(Array)
          expect(response._data.sent.totalTransactions).toBeGreaterThanOrEqual(0)
          expect(response._data.received.totalTransactions).toBeGreaterThan(0)
          expect(response._data.sent.totalValue).toBeGreaterThanOrEqual(0)
          expect(response._data.received.totalValue).toBeGreaterThan(0)
        }
      })
    })

    it('[200] get transactions summary with address and symbol filter', async () => {
      await $fetch(`/transactions/summary?address=${wallet.address}&symbol=${tokenSymbol}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.symbolsCount).toBe(1)
          expect(response._data.symbols).toEqual([tokenSymbol])
          expect(response._data.sent).toBeDefined()
          expect(response._data.received).toBeDefined()
          if (response._data.sent.bySymbol.length > 0) {
            expect(response._data.sent.bySymbol[0]._id).toBe(tokenSymbol)
          }
          if (response._data.received.bySymbol.length > 0) {
            expect(response._data.received.bySymbol[0]._id).toBe(tokenSymbol)
          }
        }
      })
    })

    it('[200] get stats with combined filters (address + symbol)', async () => {
      await $fetch(`/transactions/stats?address=${wallet.address}&symbol=${tokenSymbol}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.filters.address).toBe(wallet.address)
          expect(response._data.filters.symbol).toBe(tokenSymbol)
          expect(response._data.bySymbol.length).toBe(1)
          expect(response._data.bySymbol[0]._id).toBe(tokenSymbol)
          expect(response._data.sent).toBeDefined()
          expect(response._data.received).toBeDefined()
          expect(response._data.sent.bySymbol).toBeInstanceOf(Array)
          expect(response._data.received.bySymbol).toBeInstanceOf(Array)
          expect(response._data.sent.totalTransactions).toBeGreaterThanOrEqual(0)
          expect(response._data.received.totalTransactions).toBeGreaterThanOrEqual(0)
        }
      })
    })

    it('[200] get stats with address and date filters', async () => {
      const now = Date.now()
      const hourAgo = now - (60 * 60 * 1000) // 1 час назад

      await $fetch(`/transactions/stats?address=${wallet2.address}&from=${hourAgo}&to=${now}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.filters.address).toBe(wallet2.address)
          expect(response._data.filters.dateFrom).toBe(hourAgo.toString())
          expect(response._data.filters.dateTo).toBe(now.toString())
          // Проверяем наличие детальной статистики
          expect(response._data.sent).toBeDefined()
          expect(response._data.received).toBeDefined()
          expect(response._data.sent.totalTransactions).toBeGreaterThanOrEqual(0)
          expect(response._data.received.totalTransactions).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('/ballance', () => {
    it('[200] get ballance wallet1', async () => {
      await $fetch(`/ballance/${wallet.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data[tokenSymbol]).toBe(3121.45)
          expect(response._data[tokenSymbol2]).toBe(1000)
        }
      })
    })
  })

  it('[200] get ballance wallet2', async () => {
    await $fetch(`/ballance/${wallet2.address}`, {
      baseURL: 'http://localhost:3000',
      headers: {
        Accept: 'application/json'
      },
      onResponse: ({ response }) => {
        expect(response.status).toBe(200)
        expect(response._data[tokenSymbol]).toBe(95)
      }
    })
  })
})
