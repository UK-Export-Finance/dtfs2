import { AMENDMENT_STATUS, FACILITY_TYPE, isTfmFacilityEndDateFeatureFlagEnabled, MAPPED_FACILITY_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
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

const gefFacility = {
  facilitySnapshot: { type: MAPPED_FACILITY_TYPE.CASH },
};

const bssEwcsFacility = {
  facilitySnapshot: { type: FACILITY_TYPE.BOND },
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
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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

      it('should redirect to the amendment options selection page when the deal type is not GEF', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_CHANGE });
        api.getFacility = jest.fn().mockResolvedValueOnce(bssEwcsFacility);

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
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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

      it("should redirect to the 'Has the bank provided a facility end date' page if using FED instead of bank review date", async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: true } });
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
          isEditable: true,
          user,
        });
      });

      it('should render the template with isEditable false when amendment is found but has been completed', async () => {
        const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE, status: AMENDMENT_STATUS.COMPLETED };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: COMPLETED_AMENDMENT });
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
          isEditable: false,
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
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
          dayInput: '11',
          monthInput: '12',
          yearInput: '2025',
          isEditable: true,
          user,
        });
      });

      it('should render the template with the current bank review date as undefined if bank review date is not in the facility snapshot', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
        });
        api.getFacility = jest.fn().mockResolvedValueOnce(gefFacility);

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
          isEditable: true,
          user,
        });
      });

      it('should render the template with the current bank review date from the facility snapshot if it exists', async () => {
        const facilityWithCurrentBankReviewDate = {
          facilitySnapshot: {
            ...gefFacility.facilitySnapshot,
            dates: { isUsingFacilityEndDate: false, bankReviewDate: new Date(2025, 11, 11).toISOString() },
          },
        };

        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_BANK_REVIEW_DATE,
        });
        api.getFacility = jest.fn().mockResolvedValueOnce(facilityWithCurrentBankReviewDate);

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
          dayInput: '',
          monthInput: '',
          yearInput: '',
          currentBankReviewDate: '11 December 2025',
          isEditable: true,
          user,
        });
      });
    });
  });
});
