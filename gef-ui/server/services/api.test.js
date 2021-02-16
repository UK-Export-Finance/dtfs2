import Axios from './axios'
import * as Api from './api'
jest.mock('./axios')

afterEach(() => {
  jest.clearAllMocks();
})

describe('Api', () => {
  describe('ValidateToken', () => {
    it('returns `true` if token is valid', async () => {
      Axios.get.mockReturnValue(Promise.resolve({ status: 200 }))
      const response = await Api.validateToken()
      expect(response).toBeTruthy();
    })

    it('returns `false` if token is not valid', async () => {
      Axios.get.mockReturnValue(Promise.resolve({ status: 400 }))
      const response = await Api.validateToken()
      expect(response).toBeFalsy();
    })

    it('is able to trow an error', async () => {
      Axios.get.mockReturnValue(Promise.reject({}))
      let error
      try {
        await Api.validateToken()
      } catch (err) {
        console.log('error', err)
        error = err
      }
      expect(error).toEqual(new TypeError('Error with token'));
    })
  })
})
