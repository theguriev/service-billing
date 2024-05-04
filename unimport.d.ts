export {}
declare global {
  const $fetch: typeof import('ofetch')['$fetch']
  const afterAll: typeof import('vitest')['afterAll']
  const beforeAll: typeof import('vitest')['beforeAll']
  const describe: typeof import('vitest')['describe']
  const expect: typeof import('vitest')['expect']
  const getBallance: typeof import('/Users/eugen/work/service-billing/utils/getBallance')['default']
  const issue: typeof import('/Users/eugen/work/service-billing/utils/issue')['default']
  const it: typeof import('vitest')['it']
  const parse: typeof import('set-cookie-parser')['parse']
  const signIssue: typeof import('/Users/eugen/work/service-billing/utils/signIssue')['default']
  const signToken: typeof import('/Users/eugen/work/service-billing/utils/signToken')['default']
  const signTransaction: typeof import('/Users/eugen/work/service-billing/utils/signTransaction')['default']
  const uuidv4: typeof import('uuid')['v4']
  const verifySignature: typeof import('/Users/eugen/work/service-billing/utils/verifySignature')['default']
  const zodValidateBody: typeof import('/Users/eugen/work/service-billing/utils/zodValidateBody')['default']
  const zodValidateData: typeof import('/Users/eugen/work/service-billing/utils/zodValidateData')['default']
}