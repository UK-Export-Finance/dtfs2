import { AMENDMENT_STATUS, FACILITY_TYPE, isTfmFacilityEndDateFeatureFlagEnabled, MAPPED_FACILITY_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { MOCK_AMENDMENT_COVERENDDATE_CHANGE, MOCK_AMENDMENT_FACILITYVALUE_CHANGE } from '../../../test-mocks/amendment-test-mocks';
import { getAmendmentIsUsingFacilityEndDate } from './amendmentIsUsingFacilityEndDate.controller';

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
  facilitySnapshot: { isGef: true, type: MAPPED_FACILITY_TYPE.CASH },
};

const bssEwcsFacility = {
  facilitySnapshot: { isGef: false, type: FACILITY_TYPE.BOND },
};

const session = { user, userToken: 'mockToken' };

const { dealId, facilityId, amendmentId } = MOCK_AMENDMENT_COVERENDDATE_CHANGE;

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('amendmentIsUsingFacilityEndDate routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET getAmendmentIsUsingFacilityEndDate', () => {
    describe('when TFM Facility end date feature flag is disabled', () => {
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

        await getAmendmentIsUsingFacilityEndDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      });
    });

    describe('when TFM Facility end date feature flag is enabled', () => {
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

        await getAmendmentIsUsingFacilityEndDate(req, res);

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

        await getAmendmentIsUsingFacilityEndDate(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/amendment-options`);
      });

      it('should render template with isEditable true when amendment is found, the amendment is in progress, and the cover end date is to be changed', async () => {
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
        await getAmendmentIsUsingFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
          dealId,
          facilityId,
          isEditable: true,
          isUsingFacilityEndDate: undefined,
          user,
        });
      });

      it('should render template with isEditable false when amendment is found but the amendment has been completed', async () => {
        const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, status: AMENDMENT_STATUS.COMPLETED };

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
        await getAmendmentIsUsingFacilityEndDate(req, res);

        expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
          dealId,
          facilityId,
          isEditable: false,
          isUsingFacilityEndDate: undefined,
          user,
        });
      });
    });
  });
});
