import { getMandatoryCriteria } from './index'
import * as Api from '../../services/api'


const mockResponse = () => {
  const res = {}
  res.redirect = jest.fn()
  res.render = jest.fn()
  return res
}

const response = mockResponse()

describe('Mandatory Criteria - Controller', () => {
  describe('GET Mandatory Criteria', () => {
    const mockCriteria = {
      mockedText: 'This is a test',
    }

    beforeEach(() => {
      Api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
    })

    it('renders the `mandatory-criteria` template', async () => {
      await getMandatoryCriteria({}, response)
      expect(response.render).toHaveBeenCalledWith('templates/mandatory-criteria.njk', {
        criteria: mockCriteria
      })
    })

    it('renders the `mandatory-criteria` template with error message when there is an error', async () => {
      await getMandatoryCriteria({}, response)
      expect(response.render).toHaveBeenCalledWith('templates/mandatory-criteria.njk', {
        criteria: mockCriteria
      })
    })
  })

  describe('GET Mandatory Criteria', () => {
    const mockCriteria = {
      mockedText: 'This is a test',
    }

    beforeEach(() => {
      Api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
    })

    it('renders the `mandatory-criteria` template', async () => {
      await getMandatoryCriteria({}, response)
      expect(response.render).toHaveBeenCalledWith('templates/mandatory-criteria.njk', {
        criteria: mockCriteria
      })
    })

    it('renders the `mandatory-criteria` template with error message when there is an error', async () => {
      await getMandatoryCriteria({}, response)
      expect(response.render).toHaveBeenCalledWith('templates/mandatory-criteria.njk', {
        criteria: mockCriteria
      })
    })
  })
})
