const app = require('../../../src/createApp');
const api = require('../../api')(app);

// Added multiple versions of mock deal as submit-deal is mutating the mocks somewhere
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_2 = require('../../../src/v1/__mocks__/mock-deal-2');
const MOCK_DEAL_3 = require('../../../src/v1/__mocks__/mock-deal-3');
const MOCK_DEAL_4 = require('../../../src/v1/__mocks__/mock-deal-4');
const MOCK_DEAL_NO_PARTY_DB = require('../../../src/v1/__mocks__/mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_DEAL_NO_COMPANIES_HOUSE_2 = require('../../../src/v1/__mocks__/mock-deal-no-companies-house-2');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency');
const MOCK_DEAL_FACILITIES_USD_CURRENCY_2 = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency-2');
const MOCK_DEAL_FACILITIES_USD_CURRENCY_3 = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency-3');
const MOCK_DEAL_MIN = require('../../../src/v1/__mocks__/mock-deal-MIN');
const MOCK_DEAL_MIN_2 = require('../../../src/v1/__mocks__/mock-deal-MIN-2');
const MOCK_DEAL_MIN_3 = require('../../../src/v1/__mocks__/mock-deal-MIN-3');
const MOCK_DEAL_MIN_4 = require('../../../src/v1/__mocks__/mock-deal-MIN-4');
const MOCK_DEAL_MIA = require('../../../src/v1/__mocks__/mock-deal-MIA');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../src/v1/__mocks__/mock-currency-exchange-rate');
const MOCK_DEAL_AIN_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_DEAL_AIN_SUBMITTED_2 = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted-2');
const MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted-non-gbp-contract-value');
const DEFAULTS = require('../../../src/v1/defaults');
const CONSTANTS = require('../../../src/constants');

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

    describe('facilities', () => {
      it('adds facilityValueInGBP to all facilities that are NOT in GBP', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.dealSnapshot.bondTransactions.items[0];
        expect(bond.tfm.facilityValueInGBP).toEqual(Number(bond.facilitySnapshot.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE);

        const loan = body.dealSnapshot.loanTransactions.items[0];
        expect(loan.tfm.facilityValueInGBP).toEqual(Number(loan.facilitySnapshot.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE);
      });

      describe('all bonds that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY_2._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const bond = body.dealSnapshot.bondTransactions.items[0];
          const facilityValueInGBP = Number(bond.facilitySnapshot.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(facilityValueInGBP, bond.facilitySnapshot.coveredPercentage);

          expect(bond.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof bond.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all loans that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_FACILITIES_USD_CURRENCY_3._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const loan = body.dealSnapshot.loanTransactions.items[0];
          const facilityValueInGBP = Number(loan.facilitySnapshot.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(facilityValueInGBP, loan.facilitySnapshot.coveredPercentage);

          expect(loan.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof loan.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all bonds that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_2._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const bond = body.dealSnapshot.bondTransactions.items[0];

          expect(bond.tfm.ukefExposure).toEqual(Number(bond.tfm.ukefExposure));
          expect(bond.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL_2.details.submissionDate);
        });
      });

      describe('all loans that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_3._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const loan = body.dealSnapshot.loanTransactions.items[0];

          expect(loan.tfm.ukefExposure).toEqual(Number(loan.tfm.ukefExposure));
          expect(loan.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL_3.details.submissionDate);
        });
      });

      it('defaults all facilities riskProfile to `Flat`', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_4._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.dealSnapshot.loanTransactions.items[0];
        const loan = body.dealSnapshot.bondTransactions.items[0];

        expect(loan.tfm.riskProfile).toEqual('Flat');
        expect(bond.tfm.riskProfile).toEqual('Flat');
      });
    });

    describe('deal/case tasks', () => {
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

    describe('currency NOT GBP', () => {
      it('should convert supplyContractValue to GBP when currency is NOT GBP', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const { supplyContractValue } = MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE.submissionDetails;

        const strippedContractValue = Number(supplyContractValue.replace(/,/g, ''));

        const expected = strippedContractValue * MOCK_CURRENCY_EXCHANGE_RATE;

        expect(body.tfm.supplyContractValueInGBP).toEqual(expected);
      });
    });

    describe('exporter credit rating', () => {
      describe('when deal is AIN', () => {
        it('should add exporterCreditRating to the deal', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_AIN_SUBMITTED._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.exporterCreditRating).toEqual(DEFAULTS.CREDIT_RATING.AIN);
        });
      });

      describe('when deal is NOT AIN', () => {
        it('should add exporterCreditRating to the deal', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_MIN_2._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.exporterCreditRating).toBeUndefined();
        });
      });
    });

    describe('lossGivenDefault', () => {
      it('should be added to AIN deals', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_AIN_SUBMITTED_2._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);
        expect(body.tfm.lossGivenDefault).toEqual(DEFAULTS.LOSS_GIVEN_DEFAULT);
      });

      it('should be added to MIA deals', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_MIA._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);
        expect(body.tfm.lossGivenDefault).toEqual(DEFAULTS.LOSS_GIVEN_DEFAULT);
      });

      it('should be added to MIN deals', async () => {
        const { status, body } = await api.put({ dealId: MOCK_DEAL_MIN_3._id }).to('/v1/deals/submit');

        expect(status).toEqual(200);
        expect(body.tfm.lossGivenDefault).toEqual(DEFAULTS.LOSS_GIVEN_DEFAULT);
      });
    });

    describe('TFM deal stage', () => {
      describe('when deal is AIN and portal deal status is `Submitted`', () => {
        it('should add `Confirmed` tfm stage', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_AIN_SUBMITTED._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.stage).toEqual(CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED);
        });
      });

      describe('when deal is AIN but status is NOT `Submitted` ', () => {
        it('should NOT add `Confirmed` tfm stage', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_NO_COMPANIES_HOUSE_2._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.stage).toBeUndefined();
        });
      });

      describe('when deal is NOT AIN', () => {
        it('should NOT add `Confirmed` tfm stage', async () => {
          const { status, body } = await api.put({ dealId: MOCK_DEAL_MIN_4._id }).to('/v1/deals/submit');

          expect(status).toEqual(200);
          expect(body.tfm.stage).toBeUndefined();
        });
      });
    });
  });
});
