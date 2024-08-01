import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { MOCK_AMENDMENT_COVERENDDATE_CHANGE, MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE } from '../../../test-mocks/amendment-test-mocks';
import { postAmendCoverEndDate } from './amendCoverEndDate.controller';

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

const facility = {
  facilitySnapshot: { dates: { coverEndDate: '20 Oct 2020' } },
  tfm: {},
};

const session = { user, userToken: 'mockToken' };

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('POST postAmendCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('TFM facility end date feature flag enabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    it('should redirect to is using facility end date page when no errors', async () => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);

      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
      api.getFacility.mockResolvedValueOnce(facility);
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        body: {
          'cover-end-date-day': '12',
          'cover-end-date-month': '8',
          'cover-end-date-year': '2030',
        },
        session,
      };

      await postAmendCoverEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId}/is-using-facility-end-date`,
      );
    });
  });

  describe('TFM facility end date feature flag disabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    it('should redirect to the check answers page when no errors and only changing cover end date', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
      api.getFacility.mockResolvedValueOnce(facility);
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        body: {
          'cover-end-date-day': '12',
          'cover-end-date-month': '8',
          'cover-end-date-year': '2030',
        },
        session,
      };

      await postAmendCoverEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId}/check-answers`,
      );
    });

    it('should redirect to the amend facility value page when no errors and also amending facility value', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
      api.getFacility.mockResolvedValueOnce(facility);
      api.updateAmendment.mockResolvedValueOnce({ status: 200 });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId,
        },
        body: {
          'cover-end-date-day': '12',
          'cover-end-date-month': '8',
          'cover-end-date-year': '2030',
        },
        session,
      };

      await postAmendCoverEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.amendmentId}/facility-value`,
      );
    });
  });
});
