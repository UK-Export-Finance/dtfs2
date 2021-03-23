const app = require('../../../src/createApp');
const api = require('../../api')(app);

const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_NO_PARTY_DB = require('../../../src/v1/__mocks__/mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency');
const MOCK_DEAL_MIN = require('../../../src/v1/__mocks__/mock-deal-MIN');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../src/v1/__mocks__/mock-currency-exchange-rate');
const DEFAULTS = require('../../../src/v1/defaults');

const { findOneFacility } = require('../../../src/v1/controllers/facility.controller');
const calculateUkefExposure = require('../../../src/v1/helpers/calculateUkefExposure');

describe('/v1/deals', () => {
  describe('PUT /v1/deals/:dealId/submit', () => {
    it('404s submission for unknown id', async () => {
      const { status } = await api.put({ dealId: '12345678910' }).to('/v1/deals/submit');

      expect(status).toEqual(404);
    });

    it('returns the requested resource if no companies house no given', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_COMPANIES_HOUSE._id }).to('/v1/deals/submit');

      const tfmDeal = {
        dealSnapshot: MOCK_DEAL_NO_COMPANIES_HOUSE,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: DEFAULTS.TASKS.AIN,
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    it('returns the requested resource without partyUrn if not matched', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_PARTY_DB._id }).to('/v1/deals/submit');

      const tfmDeal = {
        dealSnapshot: MOCK_DEAL_NO_PARTY_DB,
        tfm: {
          parties: {
            exporter: {
              partyUrn: '',
            },
          },
          tasks: DEFAULTS.TASKS.AIN,
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    it('returns the requested resource with partyUrn if matched', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

      const tfmDeal = {
        dealSnapshot: MOCK_DEAL,
        tfm: {
          parties: {
            exporter: {
              partyUrn: 'testPartyUrn',
            },
          },
          tasks: DEFAULTS.TASKS.AIN,
        },
      };

      expect(status).toEqual(200);
      expect(body).toMatchObject(tfmDeal);
    });

    it('adds facilityValueInGBP to all facilities that are NOT in GBP', async () => {
      const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY._id }).to('/v1/deals/submit');

      expect(status).toEqual(200);

      const bond = body.dealSnapshot.bondTransactions.items[0];
      expect(bond.tfm.facilityValueInGBP).toEqual(Number(bond.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE);

      const loan = body.dealSnapshot.loanTransactions.items[0];
      expect(loan.tfm.facilityValueInGBP).toEqual(Number(loan.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE);
    });

    describe('all bonds that are NOT in GBP', () => {
      it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.dealSnapshot.bondTransactions.items[0];
        const facilityValueInGBP = Number(bond.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

        const calculatedUkefExposureObj = calculateUkefExposure(facilityValueInGBP, bond.coveredPercentage);

        expect(bond.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
        expect(typeof bond.tfm.ukefExposureCalculationTimestamp).toEqual('string');
      });
    });

    describe('all loans that are NOT in GBP', () => {
      it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const loan = body.dealSnapshot.loanTransactions.items[0];
        const facilityValueInGBP = Number(loan.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

        const calculatedUkefExposureObj = calculateUkefExposure(facilityValueInGBP, loan.coveredPercentage);

        expect(loan.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
        expect(typeof loan.tfm.ukefExposureCalculationTimestamp).toEqual('string');
      });
    });

    describe('all bonds that are in GBP', () => {
      it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.dealSnapshot.bondTransactions.items[0];

        expect(bond.tfm.ukefExposure).toEqual(Number(bond.ukefExposure));
        expect(bond.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL.details.submissionDate);
      });
    });

    describe('all loans that are in GBP', () => {
      it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const loan = body.dealSnapshot.loanTransactions.items[0];

        expect(loan.tfm.ukefExposure).toEqual(Number(loan.ukefExposure));
        expect(loan.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL.details.submissionDate);
      });
    });

    describe('when deal is AIN', () => {
      it('adds default AIN tasks to the deal', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_COMPANIES_HOUSE._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);
        expect(body.tfm.tasks).toEqual(DEFAULTS.TASKS.AIN);
      });
    });

    describe('when deal is NOT AIN', () => {
      it('adds NOT add default AIN tasks to the deal', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_MIN._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);
        expect(body.tfm.tasks).toBeUndefined();
      });
    });
  });
});
