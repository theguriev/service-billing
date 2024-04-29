import issueAccessToken from '@/utils/issueAccessToken'

describe('API', () => {
  const secret = String(process.env.NITRO_SECRET)
  const accessToken = issueAccessToken({ userId: '55555', email: 'eugen@guriev.net', name: 'Eugen Guriev' }, { secret })
  const wallet = {
    privateKey: '',
    address: ''
  }

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
            address: expect.any(String),
            privateKey: expect.any(String)
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
})
