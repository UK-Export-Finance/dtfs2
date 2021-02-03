const app = require('../../../src/createApp');
const api = require('../../api')(app);

const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('../../../src/v1/__mocks__/mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');

describe('/v1/deals', () => {
  describe('PUT /v1/deals/:dealId/submit', () => {
    it('404s submission for unknown id', async () => {
      const { status } = await api.put({ dealId: '12345678910' }).to('/v1/deals/submit');

      expect(status).toEqual(404);
    });

    it('returns the requested resource if no companies house no given', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_COMPANIES_HOUSE._id }).to('/v1/deals/submit');

      const tfmDeal = {
        ...MOCK_DEAL_NO_COMPANIES_HOUSE,
        tfm: {
          submissionDetails: {
            supplierPartyUrn: '',
          },
        },
      };

      expect(status).toEqual(200);
      expect(body).toEqual(tfmDeal);
    });

    it('returns the requested resource without partyUrn if not matched', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_PARTY_DB._id }).to('/v1/deals/submit');

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
      const { status, body } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');
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
