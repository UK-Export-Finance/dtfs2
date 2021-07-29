const app = require('../../../src/createApp');
const api = require('../../api')(app);
const externalApis = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const dealController = require('../../../src/v1/controllers/deal.controller');
const getGuaranteeDates = require('../../../src/v1/helpers/get-guarantee-dates');
const { generateFacilitiesListString } = require('../../../src/v1/controllers/send-issued-facilities-received-email');
const CONSTANTS = require('../../../src/constants');

const MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-AIN-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIA-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('../../../src/v1/__mocks__/mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const MOCK_MIA_SECOND_SUBMIT = require('../../../src/v1/__mocks__/mock-deal-MIA-second-submit');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const MOCK_PREMIUM_SCHEUDLE_RESPONSE = require('../../../src/v1/__mocks__/mock-premium-schedule-response');
const MOCK_FACILITIES = require('../../../src/v1/__mocks__/mock-facilities');

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

    updatePortalFacilitySpy.mockClear();
    externalApis.updatePortalFacility = updatePortalFacilitySpy;

    updatePortalFacilityStatusSpy.mockClear();
    externalApis.updatePortalFacilityStatus = updatePortalFacilityStatusSpy;
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('AIN deal - on second submission', () => {
      describe('when a facilityStage changes from `Unissued` to `Issued`', () => {
        it('should update bond status to `Acknowledged`', async () => {
          // check status before calling submit endpoint
          const initialBond = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];

          expect(initialBond.status).toEqual('Submitted');

          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedBond = body.dealSnapshot.bondTransactions.items[0];
          expect(updatedBond.status).toEqual('Acknowledged by UKEF');
        });

        it('should call updatePortalFacilityStatus with `Acknowledged` status', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const bondId = body.dealSnapshot.bondTransactions.items[0]._id;

          expect(updatePortalFacilityStatusSpy).toHaveBeenCalledWith(
            bondId,
            'Acknowledged by UKEF',
          );
        });

        it('should update bond.exposurePeriodInMonths', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedBond = body.dealSnapshot.bondTransactions.items[0];

          const expected = 12; // value is declared in mock api response.
          expect(updatedBond.tfm.exposurePeriodInMonths).toEqual(expected);
        });

        it('should add bond.facilityGuaranteeDates', async () => {
          const initialBond = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
          const dealSubmissionDate = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedBond = body.dealSnapshot.bondTransactions.items[0];

          const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
          expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
        });

        it('should add bond.premiumSchedule', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedBond = body.dealSnapshot.bondTransactions.items[0];

          const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
          expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
        });

        it('should call updatePortalFacility', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const bondId = body.dealSnapshot.bondTransactions.items[0]._id;

          expect(updatePortalFacilitySpy).toHaveBeenCalledWith(
            bondId,
            { hasBeenAcknowledged: true },
          );
        });

        it('should add bond.hasBeenAcknowledged', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const updatedBond = body.dealSnapshot.bondTransactions.items[0];

          expect(updatedBond.tfm.hasBeenAcknowledged).toEqual(true);
        });
      });

      describe('when a facilityStage changes from `Conditional` to `Unconditional`', () => {
        it('should update loan status to `Acknowledged`', async () => {
          // check status before calling submit endpoint
          const initialLoan = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
          expect(initialLoan.status).toEqual('Submitted');

          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedLoan = body.dealSnapshot.loanTransactions.items[0];
          expect(updatedLoan.status).toEqual('Acknowledged by UKEF');
        });

        it('should call updatePortalFacilityStatus with `Acknowledged` status', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const loanId = body.dealSnapshot.loanTransactions.items[0]._id;

          expect(updatePortalFacilityStatusSpy).toHaveBeenCalledWith(
            loanId,
            'Acknowledged by UKEF',
          );
        });

        it('should update loan.exposurePeriodInMonths', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

          const expected = 12; // value is declared in mock api response.
          expect(updatedLoan.tfm.exposurePeriodInMonths).toEqual(expected);
        });

        it('should add loan.facilityGuaranteeDates', async () => {
          const initialLoan = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
          const dealSubmissionDate = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

          const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
          expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
        });

        it('should add loan.premiumSchedule', async () => {
          const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          expect(status).toEqual(200);

          const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

          const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
          expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
        });

        it('should call updatePortalFacility', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const loanId = body.dealSnapshot.loanTransactions.items[0]._id;

          expect(updatePortalFacilitySpy).toHaveBeenCalledWith(
            loanId,
            { hasBeenAcknowledged: true },
          );
        });

        it('should add loan.hasBeenAcknowledged', async () => {
          const { body } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

          const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

          expect(updatedLoan.tfm.hasBeenAcknowledged).toEqual(true);
        });
      });

      it('should send an email for newly issued facilities', async () => {
        const mockDeal = MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await api.put(createSubmitBody(mockDeal)).to('/v1/deals/submit');

        expect(sendEmailApiSpy).toBeCalledTimes(1);

        const allFacilities = [
          ...mockDeal.bondTransactions.items,
          ...mockDeal.loanTransactions.items,
        ];

        const expected = {
          templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED,
          sendToEmailAddress: mockDeal.details.maker.email,
          emailVariables: {
            exporterName: mockDeal.submissionDetails['supplier-name'],
            recipientName: mockDeal.details.maker.firstname,
            bankReferenceNumber: mockDeal.details.bankSupplyContractID,
            ukefDealID: mockDeal.details.ukefDealId,
            facilitiesList: generateFacilitiesListString(allFacilities),
          },
        };

        expect(sendEmailApiSpy).toHaveBeenCalledWith(
          expected.templateId,
          expected.sendToEmailAddress,
          expected.emailVariables,
        );
      });

      it('should update ACBS for AIN`', async () => {
        const { status } = await api.put(createSubmitBody(MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');
        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).toHaveBeenCalled();
      });
    });

    describe('MIA deal - on second submission', () => {
      it('should update submissionType from MIA to MIN, add MINsubmissionDate and checkerMIN in the snapshot', async () => {
        // check submission type before submission
        expect(MOCK_MIA_SECOND_SUBMIT.details.submissionType).toEqual('Manual Inclusion Application');

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
          username: 'CHECKER-TFM',
        };

        const { status, body } = await api.put({
          ...createSubmitBody(MOCK_MIA_SECOND_SUBMIT),
          checker: mockChecker,
        }).to('/v1/deals/submit');

        expect(status).toEqual(200);

        expect(body.dealSnapshot.details.submissionType).toEqual('Manual Inclusion Notice');
        expect(typeof body.dealSnapshot.details.manualInclusionNoticeSubmissionDate).toEqual('string');
        expect(body.dealSnapshot.details.checkerMIN).toEqual(mockChecker);
        expect(dealController.submitACBSIfAllPartiesHaveUrn).toHaveBeenCalled();
      });

      it('should update bond status to `Acknowledged` if the facilityStage changes from `Unissued` to `Issued`', async () => {
        // check status before calling submit endpoint
        const initialBond = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];

        expect(initialBond.status).toEqual('Submitted');

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedBond = body.dealSnapshot.bondTransactions.items[0];
        expect(updatedBond.status).toEqual('Acknowledged by UKEF');
      });

      it('should update loan status to `Acknowledged` if the facilityStage changes from `Conditional` to `Unconditional`', async () => {
        // check status before calling submit endpoint
        const initialLoan = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        expect(initialLoan.status).toEqual('Submitted');

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedLoan = body.dealSnapshot.loanTransactions.items[0];
        expect(updatedLoan.status).toEqual('Acknowledged by UKEF');
      });

      it('should NOT update ACBS for MIA`', async () => {
        const { status } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');
        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).not.toHaveBeenCalled();
      });

      it('should add bond.facilityGuaranteeDates', async () => {
        const initialBond = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedBond = body.dealSnapshot.bondTransactions.items[0];

        const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
        expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add bond.premiumSchedule', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedBond = body.dealSnapshot.bondTransactions.items[0];

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
      });

      it('should add loan.facilityGuaranteeDates', async () => {
        const initialLoan = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

        const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
        expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add loan.premiumSchedule', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
      });

      it('should NOT send an email for each newly issued facility', async () => {
        const mockDeal = MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await api.put(createSubmitBody(mockDeal)).to('/v1/deals/submit');

        expect(sendEmailApiSpy).toBeCalledTimes(0);
      });
    });

    describe('MIN deal - on second submission', () => {
      it('should add bond.facilityGuaranteeDates', async () => {
        const initialBond = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.bondTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedBond = body.dealSnapshot.bondTransactions.items[0];

        const expected = getGuaranteeDates(initialBond, dealSubmissionDate);
        expect(updatedBond.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add bond.premiumSchedule', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedBond = body.dealSnapshot.bondTransactions.items[0];

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedBond.tfm.premiumSchedule).toEqual(expected);
      });

      it('should add loan.facilityGuaranteeDates', async () => {
        const initialLoan = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.loanTransactions.items[0];
        const dealSubmissionDate = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED.details.submissionDate;

        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

        const expected = getGuaranteeDates(initialLoan, dealSubmissionDate);
        expect(updatedLoan.tfm.facilityGuaranteeDates).toEqual(expected);
      });

      it('should add loan.premiumSchedule', async () => {
        const { status, body } = await api.put(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');

        expect(status).toEqual(200);

        const updatedLoan = body.dealSnapshot.loanTransactions.items[0];

        const expected = MOCK_PREMIUM_SCHEUDLE_RESPONSE;
        expect(updatedLoan.tfm.premiumSchedule).toEqual(expected);
      });

      it('should update ACBS for MIN`', async () => {
        const { status } = await api.put(createSubmitBody(MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED)).to('/v1/deals/submit');
        expect(status).toEqual(200);

        expect(acbsController.issueAcbsFacilities).toHaveBeenCalled();
      });

      it('should send an email for newly issued facility', async () => {
        const mockDeal = MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED;
        await api.put(createSubmitBody(mockDeal)).to('/v1/deals/submit');

        expect(sendEmailApiSpy).toBeCalledTimes(1);

        const allFacilities = [
          ...mockDeal.bondTransactions.items,
          ...mockDeal.loanTransactions.items,
        ];

        const expected = {
          templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.ISSUED_FACILITY_RECEIVED,
          sendToEmailAddress: mockDeal.details.maker.email,
          emailVariables: {
            exporterName: mockDeal.submissionDetails['supplier-name'],
            recipientName: mockDeal.details.maker.firstname,
            bankReferenceNumber: mockDeal.details.bankSupplyContractID,
            ukefDealID: mockDeal.details.ukefDealId,
            facilitiesList: generateFacilitiesListString(allFacilities),
          },
        };

        expect(sendEmailApiSpy).toHaveBeenCalledWith(
          expected.templateId,
          expected.sendToEmailAddress,
          expected.emailVariables,
        );
      });
    });
  });
});
