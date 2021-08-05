const app = require('../../../src/createApp');
const api = require('../../api')(app);
const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const calculateUkefExposure = require('../../../src/v1/helpers/calculateUkefExposure');
const CONSTANTS = require('../../../src/constants');

const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('../../../src/v1/__mocks__/mock-deal-facilities-USD-currency');
const MOCK_DEAL_ISSUED_FACILITIES = require('../../../src/v1/__mocks__/mock-deal-issued-facilities');
const MOCK_CURRENCY_EXCHANGE_RATE = require('../../../src/v1/__mocks__/mock-currency-exchange-rate');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');


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
  dealType: 'BSS/EWCS',
});

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('facilities', () => {
      it('adds facilityValueInGBP to all facilities that are NOT in GBP', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
        expect(bond.tfm.facilityValueInGBP).toEqual(
          Number(bond.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE,
        );

        const loan = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
        expect(loan.tfm.facilityValueInGBP).toEqual(
          Number(loan.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE,
        );
      });

      describe('all bonds that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const bond = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
          const facilityValueInGBP = Number(bond.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(
            facilityValueInGBP, bond.coveredPercentage,
          );

          expect(bond.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof bond.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all loans that are NOT in GBP', () => {
        it('adds ukefExposure and ukefExposureCalculationTimestamp', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_FACILITIES_USD_CURRENCY)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const loan = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
          const facilityValueInGBP = Number(loan.facilityValue) * MOCK_CURRENCY_EXCHANGE_RATE;

          const calculatedUkefExposureObj = calculateUkefExposure(
            facilityValueInGBP, loan.coveredPercentage,
          );

          expect(loan.tfm.ukefExposure).toEqual(calculatedUkefExposureObj.ukefExposure);
          expect(typeof loan.tfm.ukefExposureCalculationTimestamp).toEqual('string');
        });
      });

      describe('all bonds that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const bond = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          expect(bond.tfm.ukefExposure).toEqual(Number(bond.tfm.ukefExposure));
          expect(bond.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL.details.submissionDate);
        });
      });

      describe('all loans that are in GBP', () => {
        it('adds original ukefExposure and ukefExposureCalculationTimestamp as deal submission date', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const loan = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(loan.tfm.ukefExposure).toEqual(Number(loan.tfm.ukefExposure));
          expect(loan.tfm.ukefExposureCalculationTimestamp).toEqual(MOCK_DEAL.details.submissionDate);
        });
      });

      describe('exposure period', () => {
        it('gets the exposure period  for issued facility', async () => {
          const { status } = await api.put(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          expect(externalApis.getFacilityExposurePeriod.mock.calls).toEqual([
            ['2021-01-11', '2023-01-11', 'bond'],
            ['2021-01-11', '2023-01-11', 'loan'],
          ]);
        });

        it('does not gets the exposure period info for unissued facility', async () => {
          const { status } = await api.put(createSubmitBody(MOCK_DEAL)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          expect(externalApis.getFacilityExposurePeriod).not.toHaveBeenCalled();
        });
      });

      describe('premium scheduler', () => {
        it('gets the premium scheduler info for issued facility', async () => {
          const { status } = await api.put(createSubmitBody(MOCK_DEAL_ISSUED_FACILITIES)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          expect(externalApis.getPremiumSchedule.mock.calls).toHaveLength(2);
        });

        it('does not gets the premium scheduler info for unissued facility', async () => {
          const { status } = await api.put(createSubmitBody(MOCK_DEAL)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          expect(externalApis.getPremiumSchedule).not.toHaveBeenCalled();
        });
      });

      it('defaults all facilities riskProfile to `Flat`', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const bond = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
        const loan = body.facilities.find(({ facilityType }) => facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        expect(loan.tfm.riskProfile).toEqual('Flat');
        expect(bond.tfm.riskProfile).toEqual('Flat');
      });
    });
  });
});
