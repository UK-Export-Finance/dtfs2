const app = require('../../../src/createApp');
const api = require('../../api')(app);

const { submitDeal } = require('../../../src/v1/controllers/deal.submit.controller');

const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('../../../src/v1/__mocks__/mock-deal-no-party-db');

describe('/v1/deals', () => {
  describe('GET /v1/deals/:dealId/submit', () => {
    it('404s submission for unknown id', async () => {
      const { status } = await api.get('/v1/deals/12345678910/submit');

      expect(status).toEqual(404);
    });

    it('returns the requested resource without partyUrn if not matched', async () => {
      const { status, body } = await api.get(`/v1/deals/${MOCK_DEAL_NO_PARTY_DB._id}/submit`);

      const tfmDeal = {
        ...MOCK_DEAL_NO_PARTY_DB,
        tfm: {
          submissionDetails: {
            supplierPartyUrn: '',
          },
        },
      };

      expect(status).toEqual(200);
      expect(body).toEqual(tfmDeal);
    });

    it('returns the requested resource with partyUrn if matched', async () => {
      const { status, body } = await api.get(`/v1/deals/${MOCK_DEAL._id}/submit`);
      const tfmDeal = {
        ...MOCK_DEAL,
        tfm: {
          submissionDetails: {
            supplierPartyUrn: 'testPartyUrn',
          },
        },
      };

      expect(status).toEqual(200);
      expect(body).toEqual(tfmDeal);
    });
  });
});
