describe('API', () => {
  const wallet = {
    privateKey: '',
    address: ''
  }
  const tokenName = 'Test Token'
  const tokenSymbol = 'TST'
  const tokenEmission = 1000
  const tokenDescription = 'Test Token Description'


  const tokenName2 = 'Test Token 2'
  const tokenSymbol2 = 'ABC'
  const tokenEmission2 = 1000
  const tokenDescription2 = 'Test Token Description 2'

  let tokenId = ''
  const signature = ''
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

    it('[200] create one more token', async () => {
      await $fetch('/token', {
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
      await $fetch('/token', {
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
      await $fetch('/token?order=asc', {
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
      await $fetch('/token?limit=10', {
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
      await $fetch('/token?limit=1', {
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
      await $fetch('/token?offset=1', {
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
