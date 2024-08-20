import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS, AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import {
  MOCK_AMENDMENT_COVERENDDATE_CHANGE,
  MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
  MOCK_AMENDMENT_FACILITYVALUE_CHANGE,
} from '../../../test-mocks/amendment-test-mocks';
import { getAmendmentFacilityEndDate } from './amendmentFacilityEndDate.controller';

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

describe('amendmentFacilityEndDate routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET getAmendmentFacilityEndDate', () => {
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

        await getAmendmentFacilityEndDate(req, res);

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

        await getAmendmentFacilityEndDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      });

      it("should redirect to the 'Has the bank provided a facility end date' question page when the user has not yet selected if the facility end date is being used", async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: undefined } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentFacilityEndDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
      });

      it("should redirect to the 'Has the bank provided a facility end date' page if not using facility end date", async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: false } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };

        await getAmendmentFacilityEndDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/is-using-facility-end-date`);
      });

      it('should render the template with isEditable true when the amendment is found and is in progress', async () => {
        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
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
        const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE, status: AMENDMENT_STATUS.COMPLETED };

        api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: COMPLETED_AMENDMENT });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
          dealId,
          facilityId,
          dayInput: '',
          monthInput: '',
          yearInput: '',
          currentFacilityEndDate: undefined,
          isEditable: false,
          user,
        });
      });

      it('should render template prepopulated with the previously entered field values if the facility end date has already been added to the amendment', async () => {
        const previouslyEnteredFacilityEndDate = new Date(2025, 11, 11).toISOString();
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
            facilityEndDate: previouslyEnteredFacilityEndDate,
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
        await getAmendmentFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
          dealId,
          facilityId,
          dayInput: '11',
          monthInput: '12',
          yearInput: '2025',
          currentFacilityEndDate: undefined,
          isEditable: true,
          user,
        });
      });

      it('should render the template with the current facility date as undefined if facility end date is not in the facility snapshot', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
          },
        });
        api.getFacility = jest.fn().mockResolvedValueOnce({ facilitySnapshot: { dates: {} } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
          dealId,
          facilityId,
          dayInput: '',
          monthInput: '',
          yearInput: '',
          currentFacilityEndDate: undefined,
          isEditable: true,
          user,
        });
      });

      it('should render the template with the current facility end date from the facility snapshot if it exists', async () => {
        api.getAmendmentById.mockResolvedValueOnce({
          status: 200,
          data: {
            ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
          },
        });
        api.getFacility = jest
          .fn()
          .mockResolvedValueOnce({ facilitySnapshot: { dates: { isUsingFacilityEndDate: true, facilityEndDate: new Date(2025, 11, 11).toISOString() } } });

        const req = {
          params: {
            _id: dealId,
            amendmentId,
            facilityId,
          },
          session,
        };
        await getAmendmentFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
          dealId,
          facilityId,
          dayInput: '',
          monthInput: '',
          yearInput: '',
          currentFacilityEndDate: '11 December 2025',
          isEditable: true,
          user,
        });
      });
    });
  });
});
