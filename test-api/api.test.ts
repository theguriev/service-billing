describe('API', () => {
  const wallet = {
    privateKey: '',
    address: ''
  }
  const tokenName = 'Test Token'
  const tokenSymbol = 'TST'
  const tokenEmission = 1000
  const tokenDescription = 'Test Token Description'

  let tokenId = ''
  let signature = ''
  const transactionId = ''

  describe('/wallet', () => {
    it('[200] generate new wallet', async () => {
      await $fetch('/wallet', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            provider: null,
            address: expect.any(String),
            publicKey: expect.any(String),
            privateKey: expect.any(String),
            fingerprint: expect.any(String),
            parentFingerprint: expect.any(String),
            mnemonic: {
              phrase: expect.any(String),
              password: ''
            },
            chainCode: expect.any(String),
            path: "m/44'/60'/0'/0/0",
            index: 0,
            depth: 5
          })
          wallet.privateKey = response._data.privateKey
          wallet.address = response._data.address
        }
      })
    })

    it('[200] get ballance', async () => {
      await $fetch(`/wallet/${wallet.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject(expect.any(Object))
        }
      })
    })
  })

  describe('/token', () => {
    it('[200] get all tokens', async () => {
      await $fetch('/token', {
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
      await $fetch('/token', {
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
      await $fetch('/token', {
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
      await $fetch('/token/issue', {
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
  })

  describe('/signature', () => {
    it('[200] sign message', async () => {
      await $fetch('/signature', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          privateKey: wallet.privateKey,
          from: wallet.address,
          to: '0x',
          value: 100,
          symbol: 'TST'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          signature = response._data
          expect(typeof response._data).toBe('string')
        }
      })
    })
  })

  describe('/transaction', () => {
    it('[200] create transaction', async () => {
      await $fetch(`/transaction/${tokenSymbol}`, {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        body: {
          from: wallet.address,
          to: '0x',
          value: 100,
          message: 'hello world',
          signature: await signTransaction(wallet.privateKey, wallet.address, '0x', 100, tokenSymbol)
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            from: wallet.address,
            to: '0x',
            value: 100,
            symbol: tokenSymbol
          })
        }
      })
    })
    it('[200] get all transactions', async () => {
      await $fetch('/transaction/TST', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data.length).toBe(3)
        }
      })
    })

    it('get all transactions by address', async () => {
      await $fetch(`/transaction/address/${wallet.address}`, {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data.length).toBe(3)
        }
      })
    })
  })
})
