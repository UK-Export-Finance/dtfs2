import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import { add } from 'date-fns';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { MOCK_AMENDMENT_COVERENDDATE_CHANGE, MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE } from '../../../test-mocks/amendment-test-mocks';
import { postAmendmentBankReviewDate } from './amendmentBankReviewDate.controller';

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

  describe('POST postAmendmentBankReviewDate', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    describe('incorrect bank review date entered', () => {
      it('should render the template with errors if the entered bank review date is before the cover start date', async () => {
        const mockFacility = { facilitySnapshot: { dates: { coverStartDate: new Date(2024, 11, 11).valueOf().toString() } } };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE });
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        api.getFacility.mockResolvedValueOnce(mockFacility);

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '12',
            'bank-review-date-month': '11',
            'bank-review-date-year': '2024',
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          isEditable: true,
          facilityId,
          bankReviewDateDay: '12',
          bankReviewDateMonth: '11',
          bankReviewDateYear: '2024',
          error: {
            summary: [
              {
                text: 'The bank review date cannot be before the cover start date',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },
          user: req.session.user,
        });
      });

      it('should render the template with errors if the entered bank review date is greater than 6 years in the future', async () => {
        const mockFacility = { facilitySnapshot: { dates: { coverStartDate: new Date(2021, 11, 11).valueOf().toString() } } };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE });
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        api.getFacility.mockResolvedValueOnce(mockFacility);

        const now = new Date();
        const sixYearsFromNowPlusDay = add(now, { years: 6, days: 1 });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': sixYearsFromNowPlusDay.getDate().toString(),
            'bank-review-date-month': (sixYearsFromNowPlusDay.getMonth() + 1).toString(),
            'bank-review-date-year': sixYearsFromNowPlusDay.getFullYear().toString(),
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          isEditable: true,
          facilityId,
          bankReviewDateDay: sixYearsFromNowPlusDay.getDate().toString(),
          bankReviewDateMonth: (sixYearsFromNowPlusDay.getMonth() + 1).toString(),
          bankReviewDateYear: sixYearsFromNowPlusDay.getFullYear().toString(),
          currentBankReviewDate: undefined,
          error: {
            summary: [
              {
                text: 'Bank review date cannot be greater than 6 years in the future',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },
          user: req.session.user,
        });
      });

      it("should render the template with the current bank review date as undefined if bank review date is not in the facility snapshot and there hasn't yet been an amendment to it", async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
          },
        });
        api.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValueOnce({ status: 200, data: {} });
        api.getFacility = jest.fn().mockResolvedValueOnce({ facilitySnapshot: { dates: {} } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '',
            'bank-review-date-month': '',
            'bank-review-date-year': '',
          },
          session,
        };
        await postAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: undefined,
          error: {
            summary: [
              {
                text: 'Enter the bank review date',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },
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
        api.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValueOnce({ status: 200, data: {} });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingBankReviewDate: true, bankReviewDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '',
            'bank-review-date-month': '',
            'bank-review-date-year': '',
          },
          session,
        };
        await postAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: '11 December 2025',
          error: {
            summary: [
              {
                text: 'Enter the bank review date',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },
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
        api.getLatestCompletedAmendmentFacilityEndDate = jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: { isUsingFacilityEndDate: false, bankReviewDate: new Date(2028, 1, 1).toISOString() } });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingBankReviewDate: true, bankReviewDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
          body: {
            'bank-review-date-day': '',
            'bank-review-date-month': '',
            'bank-review-date-year': '',
          },
        };
        await postAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: '01 February 2028',
          error: {
            summary: [
              {
                text: 'Enter the bank review date',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },

          isEditable: true,
          user,
        });
      });

      it('should render the template with the current bank review date as not provided if a bank review date was originally submitted as part of the facility snapshot but a FED has been added since', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
          },
        });
        api.getLatestCompletedAmendmentFacilityEndDate = jest.fn().mockResolvedValueOnce({
          status: 200,
          data: { isUsingFacilityEndDate: true, facilityEndDate: new Date(2028, 1, 1).toISOString(), bankReviewDate: null },
        });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingBankReviewDate: true, bankReviewDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
          body: {
            'bank-review-date-day': '',
            'bank-review-date-month': '',
            'bank-review-date-year': '',
          },
        };
        await postAmendmentBankReviewDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          facilityId,
          bankReviewDateDay: '',
          bankReviewDateMonth: '',
          bankReviewDateYear: '',
          currentBankReviewDate: undefined,
          error: {
            summary: [
              {
                text: 'Enter the bank review date',
              },
            ],
            fields: ['bank-review-date-day', 'bank-review-date-month', 'bank-review-date-year'],
          },

          isEditable: true,
          user,
        });
      });
    });

    describe('correct bank review date entered', () => {
      it('should redirect to the check answers page when only the cover end date is being amended and there are no errors', async () => {
        const mockFacility = { facilitySnapshot: { dates: { coverStartDate: new Date(2024, 1, 1).valueOf().toString() } } };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE });
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        api.getFacility.mockResolvedValueOnce(mockFacility);

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '12',
            'bank-review-date-month': '11',
            'bank-review-date-year': '2025',
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
      });

      it('should redirect to the update facility value page when the facility value also needs amending and there are no errors', async () => {
        const mockFacility = { facilitySnapshot: { dates: { coverStartDate: new Date(2024, 1, 1).valueOf().toString() } } };

        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE, changeFacilityValue: true },
        });
        api.updateAmendment.mockResolvedValueOnce({ status: 200 });
        api.getFacility.mockResolvedValueOnce(mockFacility);

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '12',
            'bank-review-date-month': '11',
            'bank-review-date-year': '2025',
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      });

      it("should redirect to the amendments summary page if there's an error updating the amendment", async () => {
        const mockFacility = { facilitySnapshot: { dates: { coverStartDate: new Date(2024, 1, 1).valueOf().toString() } } };

        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE, changeFacilityValue: true },
        });
        api.updateAmendment.mockResolvedValueOnce({ status: 400 });
        api.getFacility.mockResolvedValueOnce(mockFacility);

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          body: {
            'bank-review-date-day': '12',
            'bank-review-date-month': '11',
            'bank-review-date-year': '2025',
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}#amendments`);
      });
    });
  });
});
