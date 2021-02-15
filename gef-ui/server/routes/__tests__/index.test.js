import mandatoryCriteriaRoutes from '../mandatory-criteria'
import nameApplicationRoutes from '../name-application'

const useSpy = jest.fn()
jest.doMock('express', () => {
  return {
    Router() {
      return {
        use: useSpy
      }
    }
  }
})

describe('Routes', () => {
  beforeEach(() => {
    require('../index');
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should setup all routes', () => {
    expect(useSpy).toHaveBeenCalledWith(mandatoryCriteriaRoutes)
    expect(useSpy).toHaveBeenCalledWith(nameApplicationRoutes)
  })
})
