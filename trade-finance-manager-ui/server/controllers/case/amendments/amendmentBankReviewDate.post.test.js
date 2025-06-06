import { MAPPED_FACILITY_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { add, format } from 'date-fns';
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

const now = new Date();
const oneYearFromNowMinusDay = add(now, { years: 1, days: -1 });
const oneYearFromNow = add(now, { years: 1 });
const sixYearsFromNowPlusDay = add(now, { years: 6, days: 1 });

const session = { user, userToken: 'mockToken' };

const gefFacilityType = MAPPED_FACILITY_TYPE.CASH;

const { dealId, facilityId, amendmentId } = MOCK_AMENDMENT_COVERENDDATE_CHANGE;

describe('amendmentBankReviewDate routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST postAmendmentBankReviewDate', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('incorrect bank review date entered', () => {
      it('should render the template with errors if the entered bank review date is before the cover start date', async () => {
        const mockFacility = { facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { coverStartDate: oneYearFromNow } } };

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
            'bank-review-date-day': oneYearFromNowMinusDay.getDate().toString(),
            'bank-review-date-month': (oneYearFromNowMinusDay.getMonth() + 1).toString(),
            'bank-review-date-year': oneYearFromNowMinusDay.getFullYear().toString(),
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);
        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-bank-review-date.njk', {
          dealId,
          isEditable: true,
          facilityId,
          dayInput: oneYearFromNowMinusDay.getDate().toString(),
          monthInput: (oneYearFromNowMinusDay.getMonth() + 1).toString(),
          yearInput: oneYearFromNowMinusDay.getFullYear().toString(),
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
        const mockFacility = { facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { coverStartDate: now.valueOf().toString() } } };

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
          dayInput: sixYearsFromNowPlusDay.getDate().toString(),
          monthInput: (sixYearsFromNowPlusDay.getMonth() + 1).toString(),
          yearInput: sixYearsFromNowPlusDay.getFullYear().toString(),
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

      it('should render the template with the current bank review date as undefined if bank review date is not in the facility snapshot', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
        });
        api.getFacility = jest.fn().mockResolvedValueOnce({ facilitySnapshot: { isGef: true, type: gefFacilityType, dates: {} } });

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
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

      it('should render the template with the current bank review date from the facility snapshot if it exists', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
        });
        api.getFacility = jest.fn().mockResolvedValueOnce({
          facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { isUsingBankReviewDate: true, bankReviewDate: now.toISOString() } },
        });

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
          currentBankReviewDate: format(now, 'dd MMMM yyyy'),
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
        const mockFacility = { facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { coverStartDate: now } } };

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
            'bank-review-date-day': oneYearFromNow.getDate().toString(),
            'bank-review-date-month': (oneYearFromNow.getMonth() + 1).toString(),
            'bank-review-date-year': oneYearFromNow.getFullYear().toString(),
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/check-answers`);
      });

      it('should redirect to the update facility value page when the facility value also needs amending and there are no errors', async () => {
        const mockFacility = { facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { coverStartDate: now } } };

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
            'bank-review-date-day': oneYearFromNow.getDate().toString(),
            'bank-review-date-month': (oneYearFromNow.getMonth() + 1).toString(),
            'bank-review-date-year': oneYearFromNow.getFullYear().toString(),
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/facility-value`);
      });

      it("should redirect to the amendments summary page if there's an error updating the amendment", async () => {
        const mockFacility = { facilitySnapshot: { isGef: true, type: gefFacilityType, dates: { coverStartDate: now } } };

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
            'bank-review-date-day': oneYearFromNow.getDate().toString(),
            'bank-review-date-month': (oneYearFromNow.getMonth() + 1).toString(),
            'bank-review-date-year': oneYearFromNow.getFullYear().toString(),
          },
          session,
        };

        await postAmendmentBankReviewDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}#amendments`);
      });
    });
  });
});
