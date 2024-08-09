import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS, AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import {
  MOCK_AMENDMENT_COVERENDDATE_CHANGE,
  MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
  MOCK_AMENDMENT_FACILITYVALUE_CHANGE,
} from '../../../test-mocks/amendment-test-mocks';
import { getAmendmentBankReviewDate } from './amendmentBankReviewDate.controller';

const res = mockRes();

api.getAmendmentById = jest.fn();
api.updateAmendment = jest.fn();
api.getFacility = jest.fn();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.PIM],
  email: 'test@localhost',
};

const session = { user, userToken: 'mockToken' };

const { dealId, facilityId, amendmentId } = MOCK_AMENDMENT_COVERENDDATE_CHANGE;

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('amendmentBankReviewDate routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET getAmendmentBankReviewDate', () => {
    describe('when TFM Facility end date feature flag disabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
      });

      it('should redirect to the amendment options selection page', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      });
    });

    describe('when TFM Facility end date feature flag enabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
      });

      it('should redirect to the amendment options selection page when the cover end date is not to be changed', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_CHANGE });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      });

      it("should redirect to the 'Has the bank provided a facility end date' question page when the user has not yet answered that question", async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: undefined } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
      });

      it("should redirect to the 'Has the bank provided a facility end date' page if using FED instead of bank review", async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: true } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
      });

      it('should render the template with isEditable true when the amendment is found and is in progress', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          isEditable: true,
          isUsingFacilityEndDate: undefined,
          user,
        });
      });

      it('should render the template with isEditable false when amendment is found but has been completed', async () => {
        const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE, status: AMENDMENT_STATUS.COMPLETED };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: COMPLETED_AMENDMENT });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          isEditable: false,
          isUsingFacilityEndDate: undefined,
          user,
        });
      });

      it('should render template prepopulated with the previously entered field values if the bank review date has already been added to the amendment', async () => {
        const previouslyEnteredBankReviewDate = new Date(2025, 11, 11).toISOString();
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
            bankReviewDate: previouslyEnteredBankReviewDate,
          },
        });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '11',
          bankReviewDateMonth: '12',
          bankReviewDateYear: '2025',
          isEditable: true,
          user,
        });
      });

      it("should render the template with the current bank review date as undefined if bank review date is not in the facility snapshot and there hasn't yet been an amendment to it", async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
          },
        });
        api.getLatestCompletedAmendmentBankReviewDate = jest.fn().mockResolvedValueOnce({ status: 200, data: {} });
        api.getFacility = jest.fn().mockResolvedValueOnce({ facilitySnapshot: { dates: {} } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: undefined,
          isEditable: true,
          user,
        });
      });

      it('should render the template with the current bank review date from the facility snapshot if it exists and this is the first amendment to it', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
          },
        });
        api.getLatestCompletedAmendmentBankReviewDate = jest.fn().mockResolvedValueOnce({ status: 200, data: {} });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingFacilityEndDate: false, bankReviewDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: '11 December 2025',
          isEditable: true,
          user,
        });
      });

      it('should render the template with the most recent amended bank review date value if a previous amendment to it has been made', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
          },
        });
        api.getLatestCompletedAmendmentBankReviewDate = jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: { bankReviewDate: new Date(2028, 1, 1).toISOString() } });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingFacilityEndDate: false, bankReviewDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: '01 February 2028',
          isEditable: true,
          user,
        });
      });
    });
  });
});
