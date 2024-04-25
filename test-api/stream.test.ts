import issueAccessToken from '@/utils/issueAccessToken'

describe('Walls', () => {
  const secret = String(process.env.NITRO_SECRET)
  const accessToken = issueAccessToken({ userId: '123', email: 'test@test.com', name: 'some name' }, { secret })
  let postedWallId: string

  describe('GET /', () => {
    it('gets 200 streams array', async () => {
      await $fetch('/', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          Cookie: `accessToken=${accessToken};`
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
        }
      })
    })
  })

  describe('POST /', () => {
    it('gets 400 on validation errors', async () => {
      await $fetch('/', {
        baseURL: 'http://localhost:3000',
        method: 'POST',
        ignoreResponseError: true,
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        body: {
          name: '1',
          sources: [{
            _id: '123',
            type: 'x',
            meta: {
              access: {
                token_type: 'bearer',
                expires_in: 7200,
                access_token: 'M0JIMnhKSU1pTmdnYVJYT0dmWThqR1lnWi1lWEhZQ25WN0dDM0lFMG5PdnQyOjE3MTI5MDU2NDUwNTI6MTowOmF0OjE',
                scope: 'users.read follows.read tweet.read offline.access',
                refresh_token: 'S2FGcjJIYlpVd0J1YnhzcC11TlVjYjNxUi1vR3BGM3RPUTF0ajVnSGpQcXRWOjE3MTI5MDU2NDUwNTI6MToxOnJ0OjE'
              }
            }
          }]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(400)
          expect(response._data).toMatchObject({
            url: '/',
            statusCode: 400,
            statusMessage: 'Validation Error',
            message: 'Validation Error',
            data: [
              {
                code: 'too_small',
                minimum: 3,
                type: 'string',
                inclusive: true,
                exact: false,
                message: 'String must contain at least 3 character(s)',
                path: ['name']
              }
            ]
          })
        }
      })
    })
    it('gets 200 on success creation', async () => {
      await $fetch('/', {
        baseURL: 'http://localhost:3000',
        method: 'POST',
        ignoreResponseError: true,
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        body: {
          name: 'Some stream name',
          sources: []
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({ name: 'Some stream name' })
          postedWallId = response._data._id
        }
      })
    })
    it('has one stream in it', async () => {
      await await $fetch('/', {
        baseURL: 'http://localhost:3000',
        headers: {
          Accept: 'application/json',
          Cookie: `accessToken=${accessToken};`
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data).toHaveLength(1)
        }
      })
    })
  })

  describe('GET /[id]', () => {
    it('get stream by id', async () => {
      await $fetch(`/${postedWallId}`, {
        baseURL: 'http://localhost:3000',
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toMatchObject({ name: 'Some stream name', author: '123' })
        }
      })
    })

    it('invalid objectId', async () => {
      await $fetch('/123123123', {
        baseURL: 'http://localhost:3000',
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        ignoreResponseError: true,
        onResponse: ({ response }) => {
          expect(response.status).toBe(409)
          expect(response._data).toMatchObject({ message: 'Invalid id!' })
        }
      })
    })

    it('stream not found', async () => {
      await $fetch('/65f8534bbbb8fac4c9825c00', {
        baseURL: 'http://localhost:3000',
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        ignoreResponseError: true,
        onResponse: ({ response }) => {
          expect(response.status).toBe(409)
          expect(response._data).toMatchObject({ message: 'Stream not exists!' })
        }
      })
    })
  })

  describe('PUT /[id]', () => {
    it('changes the stream name', async () => {
      const newName = 'New Name of stream'
      await $fetch(`/${postedWallId}`, {
        baseURL: 'http://localhost:3000',
        method: 'PUT',
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        body: {
          name: newName,
          sources: [{
            _id: '321',
            type: 'x',
            meta: {
              access: {
                token_type: 'bearer',
                expires_in: 7200,
                access_token: 'M0JIMnhKSU1pTmdnYVJYT0dmWThqR1lnWi1lWEhZQ25WN0dDM0lFMG5PdnQyOjE3MTI5MDU2NDUwNTI6MTowOmF0OjE',
                scope: 'users.read follows.read tweet.read offline.access',
                refresh_token: 'S2FGcjJIYlpVd0J1YnhzcC11TlVjYjNxUi1vR3BGM3RPUTF0ajVnSGpQcXRWOjE3MTI5MDU2NDUwNTI6MToxOnJ0OjE'
              }
            }
          }]
        },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data.name).toBe(newName)
          console.log('log: 🚀', response._data.sources)
          expect(response._data.sources?.[0]).toMatchObject({
            _id: '321',
            type: 'x',
            meta: {
              access: {
                token_type: 'bearer',
                expires_in: 7200,
                access_token: 'M0JIMnhKSU1pTmdnYVJYT0dmWThqR1lnWi1lWEhZQ25WN0dDM0lFMG5PdnQyOjE3MTI5MDU2NDUwNTI6MTowOmF0OjE',
                scope: 'users.read follows.read tweet.read offline.access',
                refresh_token: 'S2FGcjJIYlpVd0J1YnhzcC11TlVjYjNxUi1vR3BGM3RPUTF0ajVnSGpQcXRWOjE3MTI5MDU2NDUwNTI6MToxOnJ0OjE'
              }
            }
          })
        }
      })
    })
  })

  describe('DELETE /[id]', () => {
    it('delete the stream', async () => {
      await $fetch(`/${postedWallId}`, {
        baseURL: 'http://localhost:3000',
        method: 'DELETE',
        headers: { Accept: 'application/json', Cookie: `accessToken=${accessToken};` },
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBeInstanceOf(Array)
          expect(response._data).toHaveLength(0)
        }
      })
    })
  })
})
