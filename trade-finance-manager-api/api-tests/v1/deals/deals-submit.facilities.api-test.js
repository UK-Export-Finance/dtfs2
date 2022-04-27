const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const calculateUkefExposure = require('../../../src/v1/helpers/calculateUkefExposure');
const { calculateGefFacilityFeeRecord } = require('../../../src/v1/helpers/calculate-gef-facility-fee-record');
const CONSTANTS = require('../../../src/constants');
const submitDeal = require('../utils/submitDeal');

const MOCK_DEAL_BSS = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency');
const MOCK_DEAL_ISSUED_FACILITIES = require('../../../src/v1/__mocks__/mock-deal-issued-facilities');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../src/v1/__mocks__/mock-currency-exchange-rate');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const MOCK_GEF_DEAL = require('../../../src/v1/__mocks__/mock-gef-deal');
const MOCK_GEF_DEAL_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-MIA');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

jest.mock('../../../src/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
  submitACBSIfAllPartiesHaveUrn: jest.fn(),
}));

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
});

const findOneBankSpy = jest.fn(() => Promise.resolve({ emails: [] }));
const findOneTeamSpy = jest.fn(() => Promise.resolve({ email: [] }));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    externalApis.updatePortalBssDealStatus = jest.fn();
    externalApis.updatePortalGefDealStatus = jest.fn();
    findOneBankSpy.mockClear();
    externalApis.findOneBank = findOneBankSpy;

    findOneTeamSpy.mockClear();
    externalApis.findOneTeam = findOneTeamSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('facilities', () => {
      it('adds facilityValueInGBP to all facilities that are NOT in GBP', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY));

        expect(status).toEqual(200);

        const bond = body.facilities.find(({ type }) =>
          type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        expect(bond.tfm.facilityValueInGBP).toEqual(
          Number(bond.value) * MOCK_CURRENCY_EXCHANGE_RATE,
        );

        const loan = body.facilities.find(({ type }) =>
          type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        expect(loan.tfm.facilityValueInGBP).toEqual(
          Number(loan.value) * MOCK_CURRENCY_EXCHANGE_RATE,
        );
      });

      describe('all bonds that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY));

          expect(status).toEqual(200);

          const bond = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          const facilityValueInGBP = Number(bond.value) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(
            facilityValueInGBP,
            bond.coverPercentage,
          );

          expect(bond.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof bond.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all loans that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY));

          expect(status).toEqual(200);

          const loan = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          const facilityValueInGBP = Number(loan.value) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(
            facilityValueInGBP,
            loan.coverPercentage,
          );

          expect(loan.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof loan.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all bonds that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_BSS));

          expect(status).toEqual(200);

          const bond = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          expect(bond.tfm.ukefExposure).toEqual(Number(bond.tfm.ukefExposure));
          expect(bond.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL_BSS.details.submissionDate);
        });
      });

      describe('all loans that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_BSS));

          expect(status).toEqual(200);

          const loan = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(loan.tfm.ukefExposure).toEqual(Number(loan.tfm.ukefExposure));
          expect(loan.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL_BSS.details.submissionDate);
        });
      });

      describe('exposure period', () => {
        it('gets the exposure period for issued facility', async () => {
          const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES));

          expect(status).toEqual(200);

          expect(externalApis.getFacilityExposurePeriod.mock.calls).toEqual([
            ['2021-01-11', '2023-01-11', 'Bond'],
            ['2021-01-11', '2023-01-11', 'Loan'],
          ]);
        });

        it('does not get the exposure period info for unissued facility', async () => {
          const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_BSS));

          expect(status).toEqual(200);

          expect(externalApis.getFacilityExposurePeriod).not.toHaveBeenCalled();
        });
      });

      describe('riskProfile (BSS/EWCS facilities)', () => {
        it('defaults all facilities riskProfile to `Flat`', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_BSS));

          expect(status).toEqual(200);

          const bond = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          const loan = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(loan.tfm.riskProfile).toEqual('Flat');
          expect(bond.tfm.riskProfile).toEqual('Flat');
        });
      });

      describe('riskProfile (Cash/Contingent facilities)', () => {
        it('defaults all facilities riskProfile to `Flat`', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

          expect(status).toEqual(200);

          const cashFacility = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH);

          const contingentFacility = body.facilities.find(({ type }) =>
            type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT);

          expect(cashFacility.tfm.riskProfile).toEqual('Flat');
          expect(contingentFacility.tfm.riskProfile).toEqual('Flat');
        });
      });

      describe('premium schedule', () => {
        it('calls premium schedule for an issued facility', async () => {
          const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES));

          expect(status).toEqual(200);

          expect(externalApis.getPremiumSchedule.mock.calls).toHaveLength(1);
        });

        it('does NOT call premium schedule for an unissued facility', async () => {
          const mockDeal = {
            ...MOCK_DEAL_BSS,
            submissionCount: 0,
          };

          const { status } = await submitDeal(createSubmitBody(mockDeal));

          expect(status).toEqual(200);

          expect(externalApis.getPremiumSchedule).not.toHaveBeenCalled();
        });

        it('does NOT call premium schedule when dealType is GEF', async () => {
          const { status } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

          expect(status).toEqual(200);

          expect(externalApis.getPremiumSchedule).not.toHaveBeenCalled();
        });
      });

      describe('fee record', () => {
        describe('when facility/dealType is GEF', () => {
          it('adds fee record to issued facilities', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

            expect(status).toEqual(200);

            const issuedFacility = body.facilities.find((facility) =>
              facility.hasBeenIssued);

            const expected = calculateGefFacilityFeeRecord(issuedFacility);

            expect(issuedFacility.tfm.feeRecord).toEqual(expected);
          });

          it('does NOT add fee record to unissued facilities', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

            expect(status).toEqual(200);

            const unissuedFacility = body.facilities.find((facility) =>
              !facility.hasBeenIssued);

            expect(unissuedFacility.tfm.feeRecord).toEqual(null);
          });
        });

        it('does NOT add fee record when deal is MIA', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

          expect(status).toEqual(200);

          const issuedFacility = body.facilities.find((facility) =>
            facility.hasBeenIssued);

          expect(issuedFacility.tfm.feeRecord).toBeUndefined();
        });

        describe('when facility/dealType is BSS', () => {
          it('does NOT add fee record to any unissued facilities', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_BSS));

            expect(status).toEqual(200);

            const unissuedFacility = body.facilities.find((facility) =>
              !facility.hasBeenIssued);

            expect(unissuedFacility.tfm.feeRecord).toBeUndefined();
          });

          it('does NOT add fee record to any issued facilities', async () => {
            const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES));

            expect(status).toEqual(200);

            const issuedFacility = body.facilities.find((facility) =>
              facility.hasBeenIssued);

            expect(issuedFacility.tfm.feeRecord).toBeUndefined();
          });
        });
      });
    });

    describe('hasBeenIssuedAndAcknowledged', () => {
      describe('when facility/dealType is GEF', () => {
        it('sets hasBeenIssuedAndAcknowledged to true for issued facilities', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

          expect(status).toEqual(200);

          const issuedFacility = body.facilities.find((facility) =>
            facility.hasBeenIssued);

          expect(issuedFacility.hasBeenIssuedAndAcknowledged).toEqual(true);
        });
      });

      describe('when facility/dealType is BSS', () => {
        it('sets hasBeenIssuedAndAcknowledged to true for issued facilities', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES));

          expect(status).toEqual(200);

          const issuedFacility = body.facilities.find((facility) =>
            facility.hasBeenIssued);

          expect(issuedFacility.hasBeenIssuedAndAcknowledged).toEqual(true);
        });
      });
    });
  });
});
