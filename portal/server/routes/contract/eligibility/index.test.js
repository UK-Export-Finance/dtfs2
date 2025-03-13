const { ROLES } = require('@ukef/dtfs2-common');
const request = require('supertest');
const { router } = require('./index');
const api = require('../../../api');
const { getApiData } = require('../../../helpers');

const dealId = '123456';

jest.mock('../../../helpers', () => ({
  __esModule: true,
  requestParams: jest.fn(() => ({ userToken: 'token', _id: 123456 })),
}));
describe('eligibility criteria', () => {
  const mockReq = {
    params: {
      _id: '123456',
    },
    body: {},
    session: {
      user: {
        roles: [ROLES.MAKER],
      },
    },
  };

  const mockRes = {
    redirect: jest.fn(),
  };

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

      getApiData.mockResolvedValue(mockUpdatedDeal);

      await request(router).post(`/contract/${dealId}/eligibility/criteria`).send({});

      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith(dealId, {}, 'token');
      expect(mockRes.redirect).toHaveBeenCalledWith(`/contract/${dealId}/eligibility/criteria?errors=true`);
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

      getApiData.mockResolvedValue(mockUpdatedDeal);

      mockReq.body = { someCriteria: 'selected' };

      await request(router).post(`/contract/${dealId}/eligibility/criteria`).send({ someCriteria: 'selected' });

      expect(api.updateEligibilityCriteria).toHaveBeenCalledWith(dealId, { someCriteria: 'selected' }, 'token');
      expect(mockRes.redirect).toHaveBeenCalledWith(`/contract/${dealId}/eligibility/supporting-documentation`);
    });
  });
});
