import validateToken from './middleware/validate-token'

const getSpy = jest.fn()
const postSpy = jest.fn()
jest.doMock('express', () => {
  return {
    Router() {
      return {
        get: getSpy,
        post: postSpy
      }
    }
  }
})

describe('Routes', () => {
  beforeEach(() => {
    require('./mandatory-criteria')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/mandatory-criteria', validateToken, expect.any(Function))
    expect(postSpy).toHaveBeenCalledWith('/mandatory-criteria', validateToken, expect.any(Function))
  })
})
