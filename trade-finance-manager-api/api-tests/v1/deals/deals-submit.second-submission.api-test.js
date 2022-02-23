const moment = require('moment');
const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const dealController = require('../../../src/v1/controllers/deal.controller');
const getGuaranteeDates = require('../../../src/v1/helpers/get-guarantee-dates');
const { generateIssuedFacilitiesListString } = require('../../../src/v1/controllers/send-issued-facilities-received-email');
const { calculateGefFacilityFeeRecord } = require('../../../src/v1/helpers/calculate-gef-facility-fee-record');
const CONSTANTS = require('../../../src/constants');

const MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-AIN-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIA-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const MOCK_MIA_SECOND_SUBMIT = require('../../../src/v1/__mocks__/mock-deal-MIA-second-submit');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const MOCK_PREMIUM_SCHEUDLE_RESPONSE = require('../../../src/v1/__mocks__/mock-premium-schedule-response');
const { MOCK_FACILITIES } = require('../../../src/v1/__mocks__/mock-facilities');
const MOCK_GEF_DEAL = require('../../../src/v1/__mocks__/mock-gef-deal');
const MOCK_GEF_DEAL_SECOND_SUBMIT_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-second-submit-MIA');
const MOCK_GEF_DEAL_MIA = require('../../../src/v1/__mocks__/mock-gef-deal-MIA');
const MOCK_GEF_DEAL_MIN = require('../../../src/v1/__mocks__/mock-gef-deal-MIN');
const submitDeal = require('../utils/submitDeal');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

const updatePortalFacilityStatusSpy = jest.fn((facilityId, facilityStatusUpdate) => {
  const facility = MOCK_FACILITIES.find((f) => f._id === facilityId);

  return Promise.resolve({
    ...facility,
    status: facilityStatusUpdate,
  });
});

const updatePortalFacilitySpy = jest.fn((facilityId, facilityUpdate) => Promise.resolve(
  { ...facilityUpdate },
));

jest.mock('../../../src/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
  submitACBSIfAllPartiesHaveUrn: jest.fn(),
}));

const updateGefActivitySpy = jest.fn(() => Promise.resolve(MOCK_GEF_DEAL_MIN));

const updateGefFacilitySpy = jest.fn((facilityId, facilityUpdate) => Promise.resolve(
  facilityUpdate,
));

const createSubmitBody = (mockDeal) => ({
  dealId: mockDeal._id,
  dealType: mockDeal.dealType,
});

const createFacilityCoverEndDate = (facility) =>
  moment().set({
    date: Number(facility['coverEndDate-day']),
    month: Number(facility['coverEndDate-month']) - 1, // months are zero indexed
    year: Number(facility['coverEndDate-year']),
  });

const mockChecker = {
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated) (TFM)',
  },
  email: 'test@testing.com',
  firstname: 'Test',
  surname: 'User',
  roles: ['checker'],
  timezone: 'Europe/London',
  username: 'BANK1_CHECKER1',
};

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    externalApis.getFacilityExposurePeriod.mockClear();
    externalApis.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    externalApis.sendEmail = sendEmailApiSpy;

    updatePortalFacilitySpy.mockClear();
    externalApis.updatePortalFacility = updatePortalFacilitySpy;

    updatePortalFacilityStatusSpy.mockClear();
    externalApis.updatePortalFacilityStatus = updatePortalFacilityStatusSpy;

    updateGefActivitySpy.mockClear();
    externalApis.updateGefMINActivity = updateGefActivitySpy;

    updateGefFacilitySpy.mockClear();
    externalApis.updateGefFacility = updateGefFacilitySpy;

    externalApis.updatePortalBssDealStatus = jest.fn();
    externalApis.updatePortalGefDealStatus = jest.fn();
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('AIN deal - on second submission', () => {
      describe('when a bond facility is issued and NOT Acknowledged', () => {
        it('should update bond status to `Acknowledged`', async () => {
          // check status before calling submit endpoint
          const initialBond = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];

          expect(initialBond.status).toEqual('Submitted');

          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
          expect(status).toEqual(200);

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
          expect(updatedBond.status).toEqual('Acknowledged by UKEF');
        });

        it('should call updatePortalFacilityStatus with `Acknowledged` status', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
          const bondId = body.dealSnapshot.bondTransactions.items[0]._id;

          expect(updatePortalFacilityStatusSpy).toHaveBeenCalledWith(
            bondId,
            'Acknowledged by UKEF',
          );
        });

        it('should update bond.exposurePeriodInMonths', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          const expected = 12; // value is declared in mock api response.
          expect(updatedBond.tfm.exposurePeriodInMonths).toEqual(expected);
        });

        it('should add bond.facilityGuaranteeDates', async () => {
          const initialBond = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
          const dealSubmissionDate = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

          // add fields that are mapped in deal.submit
          initialBond.coverStartDate = initialBond.requestedCoverStartDate;
          initialBond.coverEndDate = createFacilityCoverEndDate(initialBond);
          initialBond.hasBeenIssued = true;

          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
          expect(status).toEqual(200);

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
          expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
        });

        it('should add bond.premiumSchedule', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
          expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
        });

        it('should call updatePortalFacility', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const bondId = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND)._id;

          expect(updatePortalFacilitySpy).toHaveBeenCalledWith(
            bondId,
            {
              hasBeenAcknowledged: true,
              hasBeenIssuedAndAcknowledged: true,
            },
          );
        });

        it('should add bond.hasBeenAcknowledged', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          expect(updatedBond.hasBeenAcknowledged).toEqual(true);
        });

        it('should add bond.hasBeenIssuedAndAcknowledged', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

          expect(updatedBond.hasBeenIssuedAndAcknowledged).toEqual(true);
        });
      });

      describe('when a loan faciliy is issued (`Unconditional`)', () => {
        it('should update loan status to `Acknowledged`', async () => {
          // check status before calling submit endpoint
          const initialLoan = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
          expect(initialLoan.status).toEqual('Submitted');

          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(updatedLoan.status).toEqual('Acknowledged by UKEF');
        });

        it('should call updatePortalFacilityStatus with `Acknowledged` status', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const loanId = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN)._id;

          expect(updatePortalFacilityStatusSpy).toHaveBeenCalledWith(
            loanId,
            'Acknowledged by UKEF',
          );
        });

        it('should update loan.exposurePeriodInMonths', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          const expected = 12; // value is declared in mock api response.
          expect(updatedLoan.tfm.exposurePeriodInMonths).toEqual(expected);
        });

        it('should add loan.facilityGuaranteeDates', async () => {
          const initialLoan = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
          const dealSubmissionDate = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

          // add fields that are mapped in deal.submit
          initialLoan.coverStartDate = initialLoan.requestedCoverStartDate;
          initialLoan.coverEndDate = createFacilityCoverEndDate(initialLoan);
          initialLoan.hasBeenIssued = true;

          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
          expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
        });

        it('should add loan.premiumSchedule', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          expect(status).toEqual(200);

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
          expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
        });

        it('should call updatePortalFacility', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const loanId = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN)._id;

          expect(updatePortalFacilitySpy).toHaveBeenCalledWith(
            loanId,
            {
              hasBeenAcknowledged: true,
              hasBeenIssuedAndAcknowledged: true,
            },
          );
        });

        it('should add loan.hasBeenAcknowledged', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(updatedLoan.hasBeenAcknowledged).toEqual(true);
        });

        it('should add loan.hasBeenAcknowledged', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

          const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

          expect(updatedLoan.hasBeenIssuedAndAcknowledged).toEqual(true);
        });
      });

      it('should send an email for newly issued facilities', async () => {
        const mockDeal = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await submitDeal(createSubmitBody(mockDeal));

        expect(sendEmailApiSpy).toBeCalledTimes(1);

        const allFacilities = [
          ...mockDeal.bondTransactions.items,
          ...mockDeal.loanTransactions.items,
        ];

        const expected = {
          templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED,
          sendToEmailAddress: mockDeal.maker.email,
          emailVariables: {
            exporterName: mockDeal.exporter.companyName,
            recipientName: mockDeal.maker.firstname,
            bankReferenceNumber: mockDeal.bankInternalRefName,
            ukefDealID: mockDeal.details.ukefDealId,
            facilitiesList: generateIssuedFacilitiesListString(allFacilities),
          },
        };

        expect(sendEmailApiSpy).toHaveBeenCalledWith(
          expected.templateId,
          expected.sendToEmailAddress,
          expected.emailVariables,
        );
      });

      it('should update ACBS for AIN`', async () => {
        const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).toHaveBeenCalled();
      });
    });

    describe('MIA deal - on second submission', () => {
      it('should update submissionType from MIA to MIN, add MINsubmissionDate and checkerMIN in the snapshot and call submitACBSIfAllPartiesHaveUrn', async () => {
        // check submission type before submission
        expect(MOCK_MIA_SECOND_SUBMIT.submissionType).toEqual('Manual Inclusion Application');

        const { status, body } = await submitDeal({
          ...createSubmitBody(MOCK_MIA_SECOND_SUBMIT),
          checker: mockChecker,
        });

        expect(status).toEqual(200);

        expect(body.submissionType).toEqual('Manual Inclusion Notice');
        expect(typeof body.manualInclusionNoticeSubmissionDate).toEqual('string');
        expect(dealController.submitACBSIfAllPartiesHaveUrn).toHaveBeenCalled();
      });

      it('should update bond status to `Acknowledged` if the facilityStage changes from `Unissued` to `Issued`', async () => {
        // check status before calling submit endpoint
        const initialBond = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];

        expect(initialBond.status).toEqual('Submitted');

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
        expect(status).toEqual(200);

        const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);
        expect(updatedBond.status).toEqual('Acknowledged by UKEF');
      });

      it('should update loan status to `Acknowledged` if the facilityStage changes from `Conditional` to `Unconditional`', async () => {
        // check status before calling submit endpoint
        const initialLoan = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        expect(initialLoan.status).toEqual('Submitted');

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);
        expect(updatedLoan.status).toEqual('Acknowledged by UKEF');
      });

      it('should NOT update ACBS for MIA`', async () => {
        const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).not.toHaveBeenCalled();
      });

      it('should add bond.facilityGuaranteeDates', async () => {
        const initialBond = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        // add fields that are mapped in deal.submit
        initialBond.coverStartDate = initialBond.requestedCoverStartDate;
        initialBond.coverEndDate = createFacilityCoverEndDate(initialBond);
        initialBond.hasBeenIssued = true;

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
        expect(status).toEqual(200);

        const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
        expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add bond.premiumSchedule', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
      });

      it('should add loan.facilityGuaranteeDates', async () => {
        const initialLoan = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        // add fields that are mapped in deal.submit
        initialLoan.coverStartDate = initialLoan.requestedCoverStartDate;
        initialLoan.coverEndDate = createFacilityCoverEndDate(initialLoan);
        initialLoan.hasBeenIssued = true;

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
        expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add loan.premiumSchedule', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
      });

      it('should NOT send an email for each newly issued facility', async () => {
        const mockDeal = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await submitDeal(createSubmitBody(mockDeal));

        expect(sendEmailApiSpy).toBeCalledTimes(0);
      });
    });

    describe('MIN deal - on second submission', () => {
      it('should add bond.facilityGuaranteeDates', async () => {
        const initialBond = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        // add fields that are mapped in deal.submit
        initialBond.coverStartDate = initialBond.requestedCoverStartDate;
        initialBond.coverEndDate = createFacilityCoverEndDate(initialBond);
        initialBond.hasBeenIssued = true;

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
        expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add bond.premiumSchedule', async () => {
        const initialBond = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];

        // add fields that are mapped in deal.submit
        initialBond.hasBeenIssued = true;

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedBond = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND);

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
      });

      it('should add loan.facilityGuaranteeDates', async () => {
        const initialLoan = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        // add fields that are mapped in deal.submit
        initialLoan.coverStartDate = initialLoan.requestedCoverStartDate;
        initialLoan.coverEndDate = createFacilityCoverEndDate(initialLoan);
        initialLoan.hasBeenIssued = true;

        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
        expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add loan.premiumSchedule', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));

        expect(status).toEqual(200);

        const updatedLoan = body.facilities.find((f) => f.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN);

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
      });

      it('should update ACBS for MIN`', async () => {
        const { status } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED));
        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).toHaveBeenCalled();
      });

      it('should send an email for newly issued facility', async () => {
        const mockDeal = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await submitDeal(createSubmitBody(mockDeal));

        expect(sendEmailApiSpy).toBeCalledTimes(1);

        const allFacilities = [
          ...mockDeal.bondTransactions.items,
          ...mockDeal.loanTransactions.items,
        ];

        const expected = {
          templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED,
          sendToEmailAddress: mockDeal.maker.email,
          emailVariables: {
            exporterName: mockDeal.exporter.companyName,
            recipientName: mockDeal.maker.firstname,
            bankReferenceNumber: mockDeal.bankInternalRefName,
            ukefDealID: mockDeal.details.ukefDealId,
            facilitiesList: generateIssuedFacilitiesListString(allFacilities),
          },
        };

        expect(sendEmailApiSpy).toHaveBeenCalledWith(
          expected.templateId,
          expected.sendToEmailAddress,
          expected.emailVariables,
        );
      });
    });

    describe('GEF deal - on second submission', () => {
      const mockDeal = {
        ...MOCK_GEF_DEAL,
        submissionCount: 2,
      };

      it('does NOT call premium schedule when dealType is GEF', async () => {
        const { status } = await submitDeal(createSubmitBody(mockDeal));

        expect(status).toEqual(200);

        expect(externalApis.getPremiumSchedule).not.toHaveBeenCalled();
      });

      it('should call updateGefFacility', async () => {
        const { body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL));

        const facilityId = body.facilities.find((f) => f.hasBeenIssued === true)._id;

        expect(updateGefFacilitySpy).toHaveBeenCalledWith(
          facilityId,
          {
            hasBeenIssuedAndAcknowledged: true,
          },
        );
      });

      it('adds fee record to issued facilities', async () => {
        const { status, body } = await submitDeal(createSubmitBody(mockDeal));

        expect(status).toEqual(200);

        const issuedFacility = body.facilities.find((facility) =>
          facility.hasBeenIssued);

        const expected = calculateGefFacilityFeeRecord(issuedFacility);

        expect(issuedFacility.tfm.feeRecord).toEqual(expected);
      });

      it('does NOT add fee record to unissued facilities', async () => {
        const { status, body } = await submitDeal(createSubmitBody(mockDeal));

        expect(status).toEqual(200);

        const unissuedFacility = body.facilities.find((facility) =>
          !facility.hasBeenIssued);

        expect(unissuedFacility.tfm.feeRecord).toEqual(null);
      });

      it('does NOT add fee record when deal is MIA on 1st submission', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_MIA));

        expect(status).toEqual(200);

        const issuedFacility = body.facilities.find((facility) =>
          facility.hasBeenIssued);

        expect(issuedFacility.tfm.feeRecord).toBeUndefined();
      });

      it('does add fee record when deal is MIA on 2nd submission', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_SECOND_SUBMIT_MIA));

        expect(status).toEqual(200);

        const issuedFacility = body.facilities.find((facility) =>
          facility.tfm);

        const expected = calculateGefFacilityFeeRecord(issuedFacility);

        expect(issuedFacility.tfm.feeRecord).toEqual(expected);
      });

      it('calls updateGefMINActivity when deal is MIA', async () => {
        await submitDeal(createSubmitBody(MOCK_GEF_DEAL_SECOND_SUBMIT_MIA));
        expect(updateGefActivitySpy).toHaveBeenCalledWith('MOCK_GEF_DEAL_SECOND_SUBMIT_MIA');
      });

      it('Should update the application from MIA to MIN', async () => {
        const { status, body } = await submitDeal(createSubmitBody(MOCK_GEF_DEAL_SECOND_SUBMIT_MIA));

        expect(status).toEqual(200);
        expect(body.submissionType).toEqual(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
        expect(typeof body.manualInclusionNoticeSubmissionDate).toEqual('number');
      });
    });
  });
});
