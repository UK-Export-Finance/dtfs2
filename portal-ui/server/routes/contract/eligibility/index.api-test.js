const { HttpStatusCode } = require('axios');
const request = require('supertest');
const express = require('express');
const router = require('./index'); // Adjust the path as necessary
const { getApiData, requestParams } = require('../../../helpers');
const api = require('../../../api');

jest.mock('../../../helpers');
jest.mock('../../../api');

const app = express();
app.use(express.json());
app.use(router);

describe('eligibility criteria', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /contract/:_id/eligibility/criteria', () => {
    // Arrange
    it('should redirect to criteria page with errors when validation fails', async () => {
      const mockUpdatedDeal = {
        eligibility: {
          validationErrors: {
            count: 8,
            errorList: {
              criteriaNotSelected: { order: 1, text: 'Eligibility criterion 11 is required' },
              criteriaNotSelected2: { order: 2, text: 'Eligibility criterion 12 is required' },
              criteriaNotSelected3: { order: 3, text: 'Eligibility criterion 13 is required' },
              criteriaNotSelected4: { order: 4, text: 'Eligibility criterion 14 is required' },
              criteriaNotSelected5: { order: 5, text: 'Eligibility criterion 15 is required' },
              criteriaNotSelected6: { order: 6, text: 'Eligibility criterion 16 is required' },
              criteriaNotSelected7: { order: 7, text: 'Eligibility criterion 17 is required' },
              criteriaNotSelected8: { order: 8, text: 'Eligibility criterion 18 is required' },
            },
          },
        },
      };

      api.updateEligibilityCriteria = jest.fn(() => Promise.resolve(mockUpdatedDeal));
      requestParams.mockReturnValue({ _id: '123456', userToken: 'token' });
      getApiData.mockResolvedValue(mockUpdatedDeal);

      // Act
      const response = await request(app).post('/contract/123456/eligibility/criteria').send({});

      // Assert
      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith('123456', {}, 'token');
      expect(response.status).toBe(HttpStatusCode.Found);
      expect(response.headers.location).toBe('/contract/123456/eligibility/criteria?errors=true');
      expect(mockUpdatedDeal.eligibility.validationErrors.count).toBe(8);
    });

    it('should redirect to supporting documentation page when validationErrors does not exist', async () => {
      // Arrange
      const mockUpdatedDeal = {
        eligibility: {},
      };

      api.updateEligibilityCriteria = jest.fn(() => Promise.resolve(mockUpdatedDeal));
      requestParams.mockReturnValue({ _id: '123456', userToken: 'token' });
      getApiData.mockResolvedValue(mockUpdatedDeal);

      // Act
      const response = await request(app).post('/contract/123456/eligibility/criteria').send({});

      // Assert
      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith('123456', {}, 'token');
      expect(response.status).toBe(HttpStatusCode.Found);
      expect(response.headers.location).toBe('/contract/123456/eligibility/supporting-documentation');
      expect(mockUpdatedDeal.eligibility.validationErrors).toBeUndefined();
    });

    it('should redirect to supporting documentation page when criteria are valid', async () => {
      // Arrange
      const mockUpdatedDeal = {
        eligibility: {
          validationErrors: {
            count: 0,
          },
        },
      };

      api.updateEligibilityCriteria = jest.fn(() => Promise.resolve(mockUpdatedDeal));
      requestParams.mockReturnValue({ _id: '123456', userToken: 'token' });
      getApiData.mockResolvedValue(mockUpdatedDeal);

      // Act
      const response = await request(app).post('/contract/123456/eligibility/criteria').send({ someCriteria: 'selected' });

      // Assert
      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith('123456', { someCriteria: 'selected' }, 'token');
      expect(response.status).toBe(HttpStatusCode.Found);
      expect(response.headers.location).toBe('/contract/123456/eligibility/supporting-documentation');
      expect(mockUpdatedDeal.eligibility.validationErrors.count).toBe(0);
    });
  });
});
