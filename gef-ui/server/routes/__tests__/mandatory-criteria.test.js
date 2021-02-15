import { 
  getMandatoryCriteria,
  validateMandatoryCriteria
} from '../../controllers/mandatory-criteria'

const useSpy = jest.fn()
const getSpy = jest.fn()
const postSpy = jest.fn()
const validateToken = jest.fn()
jest.doMock('express', () => {
  return {
    Router() {
      return {
        use: useSpy,
        get: getSpy,
        post: postSpy
      }
    }
  }
})

describe('Routes', () => {
  beforeEach(() => {
    require('../index')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should setup all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/mandatory-criteria',  validateToken, () => getMandatoryCriteria())
  })
})
