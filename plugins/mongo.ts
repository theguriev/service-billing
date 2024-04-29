import { connect } from 'mongoose'

export default defineNitroPlugin(async () => {
  const { mongoUri } = useRuntimeConfig()
  console.info('🚚 Connecting...', mongoUri)
  await connect(mongoUri)
  console.info('Connected to MongoDB 🚀', mongoUri)
  if (process.env.MODE === 'test') {
    console.log('=========================================')
    console.log('🔑 Test acces token: ', issueAccessToken({ userId: '123' }, { secret: 'secret', expiresIn: '9000m' }))
    console.log('=========================================')
  }
})
