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
    it('should redirect to criteria page with errors when validation fails', async () => {
      const mockUpdatedDeal = {
        eligibility: {
          validationErrors: {
            count: 1,
            errorList: {
              criteriaNotSelected: { order: 1, text: 'Select at least one eligibility criterion' },
            },
          },
        },
      };

      api.updateEligibilityCriteria = jest.fn(() => Promise.resolve(mockUpdatedDeal));
      requestParams.mockReturnValue({ _id: '123456', userToken: 'token' });
      getApiData.mockResolvedValue(mockUpdatedDeal);

      const response = await request(app).post('/contract/123456/eligibility/criteria').send({});

      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith('123456', {}, 'token');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/contract/123456/eligibility/criteria?errors=true');
    });

    it('should redirect to supporting documentation page when criteria are valid', async () => {
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

      const response = await request(app).post('/contract/123456/eligibility/criteria').send({ someCriteria: 'selected' });

      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith('123456', { someCriteria: 'selected' }, 'token');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/contract/123456/eligibility/supporting-documentation');
    });
  });
});
