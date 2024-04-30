import issueAccessToken from '@/utils/issueAccessToken'

describe('API', () => {
  const secret = String(process.env.NITRO_SECRET)
  const accessToken = issueAccessToken({ userId: '55555', email: 'eugen@guriev.net', name: 'Eugen Guriev' }, { secret })
  const wallet = {
    privateKey: '',
    address: ''
  }
  let signature = ''

  describe('/wallet', () => {
    it.only('[200] generate new wallet', async () => {
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
          expect(response._data).toMatchObject({
            ballanceBySymbol: expect.any(Object),
            income: expect.any(Array),
            incomeBySymbol: expect.any(Object),
            outcome: expect.any(Array),
            outcomeBySymbol: expect.any(Object)
          })
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
          Accept: 'application/json',
          Cookie: `accessToken=${accessToken}`
        },
        body: {
          name: 'Test Token',
          symbol: 'TST',
          wallet: wallet.address,
          emission: 1000
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            name: 'Test Token',
            symbol: 'TST',
            author: '55555'
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
          expect(response._data[0]).toMatchObject({
            name: 'Test Token',
            symbol: 'TST',
            author: '55555'
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
          Accept: 'application/json',
          Cookie: `accessToken=${accessToken}`
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
    it('[200] get all transactions', async () => {
      await $fetch('/transaction/TST', {
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

    it('[200] create transaction', async () => {
      await $fetch('/transaction/TST', {
        method: 'POST',
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          Cookie: `accessToken=${accessToken}`
        },
        body: {
          from: wallet.address,
          to: '0x',
          value: 100,
          message: 'hello world',
          signature
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({
            from: wallet.address,
            to: '0x',
            value: 100,
            symbol: 'TST'
          })
        }
      })
    })

    it('[200] transaction successfully added', async () => {
      await $fetch('/transaction/TST', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json'
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data.length).toBe(2)
          expect(response._data[1]).toMatchObject({
            from: wallet.address,
            to: '0x',
            value: 100,
            symbol: 'TST'
          })
        }
      })
    })
  })
})
