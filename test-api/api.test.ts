import issueAccessToken from '@/utils/issueAccessToken'

describe('API', () => {
  const secret = String(process.env.NITRO_SECRET)
  const accessToken = issueAccessToken({ userId: '55555', email: 'eugen@guriev.net', name: 'Eugen Guriev' }, { secret })
  const wallet = {
    privateKey: '',
    address: ''
  }

  describe('GET /wallet', () => {
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
      console.log('wallet', `/wallet/${wallet.address}`)
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
})
