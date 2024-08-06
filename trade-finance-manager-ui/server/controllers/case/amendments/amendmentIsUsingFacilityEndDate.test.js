import { AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import {
  MOCK_AMENDMENT_COVERENDDATE_CHANGE,
  MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE,
  MOCK_AMENDMENT_FACILITYVALUE_CHANGE,
} from '../../../test-mocks/amendment-test-mocks';
import { getAmendmentIsUsingFacilityEndDate, postAmendmentIsUsingFacilityEndDate } from './amendmentIsUsingFacilityEndDate.controller';

const res = mockRes();

api.getAmendmentById = jest.fn();
api.updateAmendment = jest.fn();

const user = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.PIM],
  email: 'test@localhost',
};

const session = { user, userToken: 'mockToken' };

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('GET getAmendIsUsingFacilityEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('TFM Facility end date feature flag disabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    it('should redirect to the amendment options selection page', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };

      await getAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId}/amendment-options`,
      );
    });
  });

  describe('TFM Facility end date feature flag enabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    it('should redirect to the amendment options selection page when the cover end date is not to be changed', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_CHANGE });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId,
        },
        session,
      };

      await getAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId}/amendment-options`,
      );
    });

    it('should render template with isEditable true when amendment is found, the amendment is in progress, and the cover end date is to be changed', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };
      await getAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
        dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        isEditable: true,
        isUsingFacilityEndDate: undefined,
        user,
      });
    });

    it('should render template with isEditable false when amendment is found but the amendment has been completed', async () => {
      const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, status: AMENDMENT_STATUS.COMPLETED };

      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: COMPLETED_AMENDMENT });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };
      await getAmendmentIsUsingFacilityEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
        dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        isEditable: false,
        isUsingFacilityEndDate: undefined,
        user,
      });
    });
  });
});

describe('POST postAmendIsUsingFacilityEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
  });

  it('should render the template with errors if no value is provided', async () => {
    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
      },
      session,
      body: {
        isUsingFacilityEndDate: undefined,
      },
    };

    await postAmendmentIsUsingFacilityEndDate(req, res);
    expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-is-using-facility-end-date.njk', {
      dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
      isEditable: true,
      facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
      isUsingFacilityEndDate: undefined,
      errors: {
        errorSummary: [
          {
            text: 'Select if the bank has provided an end date for this facility',
            href: '#isUsingFacilityEndDate',
          },
        ],
        fieldErrors: {
          isUsingFacilityEndDate: { text: 'Select if the bank has provided an end date for this facility' },
        },
      },
      user: req.session.user,
    });
  });

  it('should redirect to the check answers page when only the cover end date is being amended and there are no errors', async () => {
    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
      },
      body: {
        isUsingFacilityEndDate: true,
      },
      session,
    };

    await postAmendmentIsUsingFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId}/check-answers`,
    );
  });

  it('should redirect to the update facility value page when the facility value also needs amending and there are no errors', async () => {
    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });

    const req = {
      params: {
        _id: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId,
        amendmentId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.amendmentId,
        facilityId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId,
      },
      body: {
        isUsingFacilityEndDate: true,
      },
      session,
    };

    await postAmendmentIsUsingFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.amendmentId}/facility-value`,
    );
  });

  it("should redirect to the amendments summary page if there's an error updating the amendment", async () => {
    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE });
    api.updateAmendment.mockResolvedValueOnce({ status: 400 });

    const req = {
      params: {
        _id: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId,
        amendmentId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.amendmentId,
        facilityId: MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId,
      },
      body: {
        isUsingFacilityEndDate: true,
      },
      session,
    };

    await postAmendmentIsUsingFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_AND_COVERENDDATE_CHANGE.facilityId}#amendments`,
    );
  });
});
