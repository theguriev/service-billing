describe.sequential('API', () => {
  const wallet = Wallet.createRandom()
  const wallet2 = Wallet.createRandom()
  const wallet3 = Wallet.createRandom()
  const wallet4 = Wallet.createRandom()

  const tokenName = 'Test Token'
  const tokenSymbol = 'TST'
  const tokenEmission = 1000
  const tokenDescription = 'Test Token Description'

  const tokenName2 = 'Test Token 2'
  const tokenSymbol2 = 'ABC'
  const tokenEmission2 = 1000
  const tokenDescription2 = 'Test Token Description 2'

  const tokenName3 = 'Test Token 3'
  const tokenSymbol3 = 'XYZ'
  const tokenEmission3 = 1000
  const tokenDescription3 = 'Test Token Description 3'

  const tokenName4 = 'Test Token 4'
  const tokenSymbol4 = 'LMN'
  const tokenEmission4 = 1000
  const tokenDescription4 = 'Test Token Description 4'

  let tokenId = ''

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
    beforeAll(async () => {
      await $fetch('/tokens', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          name: tokenName3,
          symbol: tokenSymbol3,
          address: wallet3.address,
          emission: tokenEmission3,
          description: tokenDescription3,
          signature: await signToken(wallet3.privateKey, tokenName3, wallet3.address, tokenEmission3, tokenSymbol3)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            address: wallet3.address,
            name: tokenName3,
            symbol: tokenSymbol3,
            description: tokenDescription3
          })
        }
      })

      await $fetch('/tokens', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          name: tokenName4,
          symbol: tokenSymbol4,
          address: wallet4.address,
          emission: tokenEmission4,
          description: tokenDescription4,
          signature: await signToken(wallet4.privateKey, tokenName4, wallet4.address, tokenEmission4, tokenSymbol4)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            address: wallet4.address,
            name: tokenName4,
            symbol: tokenSymbol4,
            description: tokenDescription4
          })
        }
      })
    })
    it('[200] get zero ballance', async () => {
      const walletZeroBalance = Wallet.createRandom()
      await $fetch(`/ballance/${walletZeroBalance.address}`, {
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

    it('[400] get multiple balances - empty array', async () => {
      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: []
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
        }
      })
    })

    it('[400] get multiple balances - invalid body', async () => {
      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          wrongField: ['address1']
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
        }
      })
    })

    it('[400] get multiple balances - addresses not array', async () => {
      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: 'not-an-array'
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
        }
      })
    })

    it('[400] get multiple balances - too many addresses', async () => {
      const manyAddresses = Array.from({ length: 101 }, (_, i) => `0x${i.toString().padStart(40, '0')}`)

      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: manyAddresses
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
        }
      })
    })

    it('[200] get multiple balances - single address', async () => {
      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [wallet3.address]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)

          expect(response._data.results[wallet3.address].ballanceBySymbol[tokenSymbol3]).toBe(tokenEmission3)
          expect(response._data.results[wallet3.address].incomeTransactionCount).toBeGreaterThan(0)
          expect(response._data.results[wallet3.address].outcomeTransactionCount).toBe(0)
        }
      })
    })

    it('[200] get multiple balances - multiple addresses', async () => {
      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [wallet3.address, wallet4.address]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)

          expect(response._data.results[wallet3.address].ballanceBySymbol[tokenSymbol3]).toBe(tokenEmission3)
          expect(response._data.results[wallet3.address].incomeTransactionCount).toBeGreaterThan(0)
          expect(response._data.results[wallet3.address].outcomeTransactionCount).toBe(0)

          expect(response._data.results[wallet4.address].ballanceBySymbol[tokenSymbol4]).toBe(tokenEmission4)
          expect(response._data.results[wallet4.address].incomeTransactionCount).toBeGreaterThan(0)
          expect(response._data.results[wallet4.address].outcomeTransactionCount).toBe(0)
        }
      })
    })

    it('[200] get multiple balances - with non-existent addresses', async () => {
      const nonExistentAddress = '0x1234567890123456789012345678901234567890'

      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [wallet.address, nonExistentAddress, wallet2.address]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            results: expect.any(Object),
            totalAddresses: 3,
            successfulRequests: 3,
            failedRequests: 0
          })

          const nonExistentResult = response._data.results[nonExistentAddress]
          expect(nonExistentResult).toBeDefined()
          expect(nonExistentResult.ballanceBySymbol).toEqual({})
          expect(nonExistentResult.success).toBe(true)
          expect(nonExistentResult.incomeTransactionCount).toBe(0)
          expect(nonExistentResult.outcomeTransactionCount).toBe(0)
        }
      })
    })

    it('[200] get multiple balances - maximum allowed addresses', async () => {
      // Создаем 100 адресов (максимум разрешенный)
      const maxAddresses = Array.from({ length: 100 }, (_, i) => {
        if (i === 0) {
          return wallet3.address
        }
        if (i === 1) {
          return wallet4.address
        }
        return `0x${i.toString().padStart(40, '0')}`
      })

      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: maxAddresses
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            results: expect.any(Object),
            totalAddresses: 100,
            successfulRequests: 100,
            failedRequests: 0
          })

          const wallet3Result = response._data.results[wallet3.address]
          expect(wallet3Result.address).toBe(wallet3.address)
          expect(wallet3Result.ballanceBySymbol[tokenSymbol3]).toBe(tokenEmission3)

          const wallet4Result = response._data.results[wallet4.address]
          expect(wallet4Result.address).toBe(wallet4.address)
          expect(wallet4Result.ballanceBySymbol[tokenSymbol4]).toBe(tokenEmission4)
        }
      })
    })

    it('[200] get multiple balances - performance test', async () => {
      const addresses = [wallet.address, wallet2.address]
      const startTime = Date.now()

      await $fetch('/ballance', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses
        },
        onResponse: ({ response }) => {
          const endTime = Date.now()
          const duration = endTime - startTime

          expect(response.status).toBe(200)
          // Проверяем, что запрос выполняется быстро (менее 1 секунды)
          expect(duration).toBeLessThan(1000)

          // Проверяем структуру ответа
          expect(response._data.totalAddresses).toBe(2)
          expect(response._data.successfulRequests).toBe(2)
        }
      })
    })
  })

  describe('/addresses/activity', () => {
    it('[200] check activity for addresses with transactions', async () => {
      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [wallet.address, wallet2.address]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            [wallet.address]: true, // has transactions
            [wallet2.address]: true // has transactions
          })
        }
      })
    })

    it('[200] check activity for non-existent addresses', async () => {
      const nonExistentAddress = '0x1234567890123456789012345678901234567890'

      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [nonExistentAddress]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual({
            [nonExistentAddress]: false
          })
        }
      })
    })

    it('[200] check activity for mixed addresses', async () => {
      const nonExistentAddress = '0x1111111111111111111111111111111111111111'

      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: [wallet.address, nonExistentAddress, wallet2.address]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            [wallet.address]: true,
            [nonExistentAddress]: false,
            [wallet2.address]: true
          })
        }
      })
    })

    it('[400] check activity - empty addresses array', async () => {
      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: []
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
          expect(response._data).toHaveProperty('error')
        }
      })
    })

    it('[400] check activity - too many addresses', async () => {
      const manyAddresses = Array.from({ length: 101 }, (_, i) => `0x${i.toString().padStart(40, '0')}`)

      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: manyAddresses
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
          expect(response._data).toHaveProperty('error')
        }
      })
    })

    it('[400] check activity - missing addresses field', async () => {
      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {},
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
          expect(response._data).toHaveProperty('error')
        }
      })
    })

    it('[400] check activity - invalid addresses type', async () => {
      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        ignoreResponseError: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: 'not-an-array'
        },
        onResponseError: ({ response }) => {
          expect(response.status).toBe(400)
          expect(response._data).toHaveProperty('error')
        }
      })
    })

    it('[200] check activity - maximum allowed addresses', async () => {
      // Создаем 100 адресов (максимум разрешенный)
      const maxAddresses = Array.from({ length: 100 }, (_, i) => {
        if (i === 0) {
          return wallet.address
        }
        if (i === 1) {
          return wallet2.address
        }
        return `0x${i.toString().padStart(40, '0')}`
      })

      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses: maxAddresses
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(typeof response._data).toBe('object')
          expect(Object.keys(response._data)).toHaveLength(100)

          // Проверяем, что известные адреса активны
          expect(response._data[wallet.address]).toBe(true)
          expect(response._data[wallet2.address]).toBe(true)

          // Проверяем, что неизвестные адреса неактивны
          expect(response._data['0x0000000000000000000000000000000000000002']).toBe(false)
        }
      })
    })

    it('[200] check activity - performance test', async () => {
      const addresses = [wallet.address, wallet2.address, wallet3.address, wallet4.address]
      const startTime = Date.now()

      await $fetch('/addresses/activity', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
          addresses
        },
        onResponse: ({ response }) => {
          const endTime = Date.now()
          const duration = endTime - startTime

          expect(response.status).toBe(200)
          // Проверяем, что запрос выполняется быстро (менее 500мс)
          expect(duration).toBeLessThan(500)

          // Проверяем структуру ответа
          expect(Object.keys(response._data)).toHaveLength(4)
          addresses.forEach((address) => {
            expect(response._data).toHaveProperty(address)
            expect(typeof response._data[address]).toBe('boolean')
          })
        }
      })
    })
  })
})
