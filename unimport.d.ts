export {}
declare global {
  const $fetch: typeof import('ofetch')['$fetch']
  const afterAll: typeof import('vitest')['afterAll']
  const beforeAll: typeof import('vitest')['beforeAll']
  const describe: typeof import('vitest')['describe']
  const expect: typeof import('vitest')['expect']
  const getBallance: typeof import('/Users/eugen/work/service-billing/utils/getBallance')['default']
  const getUserId: typeof import('/Users/eugen/work/service-billing/utils/getUserId')['default']
  const issueAccessToken: typeof import('/Users/eugen/work/service-billing/utils/issueAccessToken')['default']
  const it: typeof import('vitest')['it']
  const parse: typeof import('set-cookie-parser')['parse']
  const uuidv4: typeof import('uuid')['v4']
  const verify: typeof import('/Users/eugen/work/service-billing/utils/verify')['default']
  const zodValidateBody: typeof import('/Users/eugen/work/service-billing/utils/zodValidateBody')['default']
  const zodValidateData: typeof import('/Users/eugen/work/service-billing/utils/zodValidateData')['default']
}