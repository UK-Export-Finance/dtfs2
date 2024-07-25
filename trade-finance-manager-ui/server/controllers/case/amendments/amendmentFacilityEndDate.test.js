import { isTfmFacilityEndDateFeatureFlagEnabled, TEAM_IDS } from '@ukef/dtfs2-common';
import { add } from 'date-fns';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import {
  MOCK_AMENDMENT_COVERENDDATE_CHANGE,
  MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
  MOCK_AMENDMENT_FACILITYVALUE_CHANGE,
} from '../../../test-mocks/amendment-test-mocks';
import CONSTANTS from '../../../constants';
import { getAmendmentFacilityEndDate, postAmendmentFacilityEndDate } from './amendmentFacilityEndDate.controller';

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('GET getAmendmentFacilityEndDate', () => {
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

      await getAmendmentFacilityEndDate(req, res);

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

      await getAmendmentFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId}/amendment-options`,
      );
    });

    it('should redirect to the is using facility end date question page when the user has not yet selected if the facility end date is being used', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: undefined } });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId,
        },
        session,
      };

      await getAmendmentFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId}/is-using-facility-end-date`,
      );
    });

    it('should redirect to the is using facility end date question if the facility end date is not to be changed', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE, isUsingFacilityEndDate: false } });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId,
        },
        session,
      };

      await getAmendmentFacilityEndDate(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `/case/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.facilityId}/amendment/${MOCK_AMENDMENT_FACILITYVALUE_CHANGE.amendmentId}/is-using-facility-end-date`,
      );
    });

    it('should render template with isEditable true when amendment is found and the amendment is in progress', async () => {
      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };
      await getAmendmentFacilityEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
        dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        facilityEndDateDay: '',
        facilityEndDateMonth: '',
        facilityEndDateYear: '',
        isEditable: true,
        isUsingFacilityEndDate: undefined,
        user,
      });
    });

    it('should render template with isEditable false when amendment is found but the amendment has been completed', async () => {
      const COMPLETED_AMENDMENT = { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE, status: CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.COMPLETED };

      api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: COMPLETED_AMENDMENT });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };
      await getAmendmentFacilityEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
        dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        facilityEndDateDay: '',
        facilityEndDateMonth: '',
        facilityEndDateYear: '',
        isEditable: false,
        isUsingFacilityEndDate: undefined,
        user,
      });
    });

    it('should render template prepopulated with the previously entered field values if the facility end date has already been added to the amendment', async () => {
      const previouslyEnteredFacilityEndDate = getUnixTime(new Date(2025, 11, 11));
      api.getAmendmentById.mockResolvedValueOnce({
        status: 200,
        data: {
          ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE,
          facilityEndDate: previouslyEnteredFacilityEndDate,
        },
      });

      const req = {
        params: {
          _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
          amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.amendmentId,
          facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        },
        session,
      };
      await getAmendmentFacilityEndDate(req, res);

      expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
        dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
        facilityEndDateDay: '11',
        facilityEndDateMonth: '12',
        facilityEndDateYear: '2025',
        isEditable: true,
        user,
      });
    });
  });
});

describe('POST postAmendmentFacilityEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
  });

  it('should render the template with errors if the entered facility end date is before the cover start date', async () => {
    const mockFacility = { facilitySnapshot: { dates: { coverStartDate: getUnixTime(new Date(2025, 11, 11)) * 1000 } } };

    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });
    api.getFacility.mockResolvedValueOnce(mockFacility);

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId,
      },
      body: {
        'facility-end-date-day': 12,
        'facility-end-date-month': 11,
        'facility-end-date-year': 2024,
      },
      session,
    };

    await postAmendmentFacilityEndDate(req, res);
    expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
      dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
      isEditable: true,
      facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
      facilityEndDateDay: 12,
      facilityEndDateMonth: 11,
      facilityEndDateYear: 2024,
      errors: {
        summary: [
          {
            text: 'The facility end date cannot be before the cover start date',
          },
        ],
        fields: ['facilityEndDate'],
      },
      user: req.session.user,
    });
  });

  it('should render the template with errors if the entered facility end date is greater than 6 years in the future', async () => {
    const mockFacility = { facilitySnapshot: { dates: { coverStartDate: getUnixTime(new Date(2025, 11, 11)) * 1000 } } };

    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });
    api.getFacility.mockResolvedValueOnce(mockFacility);

    const now = new Date();
    const sixYearsFromNowPlusDay = add(now, { years: 6, days: 1 });

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId,
      },
      body: {
        'facility-end-date-day': sixYearsFromNowPlusDay.getDate(),
        'facility-end-date-month': sixYearsFromNowPlusDay.getMonth() + 1,
        'facility-end-date-year': sixYearsFromNowPlusDay.getFullYear(),
      },
      session,
    };

    await postAmendmentFacilityEndDate(req, res);
    expect(res.render).toHaveBeenCalledWith('case/amendments/amendment-facility-end-date.njk', {
      dealId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId,
      isEditable: true,
      facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId,
      facilityEndDateDay: sixYearsFromNowPlusDay.getDate(),
      facilityEndDateMonth: sixYearsFromNowPlusDay.getMonth() + 1,
      facilityEndDateYear: sixYearsFromNowPlusDay.getFullYear(),
      errors: {
        summary: [
          {
            text: 'Facility end date cannot be greater than 6 years in the future',
          },
        ],
        fields: ['facilityEndDate'],
      },
      user: req.session.user,
    });
  });

  it('should redirect to the check answers page when only the cover end date is being amended and there are no errors', async () => {
    const mockFacility = { facilitySnapshot: { dates: { coverStartDate: getUnixTime(new Date(2021, 11, 11)) * 1000 } } };

    api.getAmendmentById.mockResolvedValueOnce({ status: 200, data: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });
    api.getFacility.mockResolvedValueOnce(mockFacility);

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId,
      },
      body: {
        'facility-end-date-day': 12,
        'facility-end-date-month': 11,
        'facility-end-date-year': 2025,
      },
      session,
    };

    await postAmendmentFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId}/check-answers`,
    );
  });

  it('should redirect to the update facility value page when the facility value also needs amending and there are no errors', async () => {
    const mockFacility = { facilitySnapshot: { dates: { coverStartDate: getUnixTime(new Date(2021, 11, 11)) * 1000 } } };

    api.getAmendmentById.mockResolvedValueOnce({
      status: 200,
      data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE, changeFacilityValue: true },
    });
    api.updateAmendment.mockResolvedValueOnce({ status: 200 });
    api.getFacility.mockResolvedValueOnce(mockFacility);

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId,
      },
      body: {
        'facility-end-date-day': 12,
        'facility-end-date-month': 11,
        'facility-end-date-year': 2025,
      },
      session,
    };

    await postAmendmentFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId}/amendment/${MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId}/facility-value`,
    );
  });

  it("should redirect to the amendments summary page if there's an error updating the amendment", async () => {
    const mockFacility = { facilitySnapshot: { dates: { coverStartDate: getUnixTime(new Date(12, 11, 2021)) } } };

    api.getAmendmentById.mockResolvedValueOnce({
      status: 200,
      data: { ...MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE, changeFacilityValue: true },
    });
    api.updateAmendment.mockResolvedValueOnce({ status: 400 });
    api.getFacility.mockResolvedValueOnce(mockFacility);

    const req = {
      params: {
        _id: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.dealId,
        amendmentId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.amendmentId,
        facilityId: MOCK_AMENDMENT_COVERENDDATE_CHANGE_USING_FACILITY_ENDDATE.facilityId,
      },
      body: {
        'facility-end-date-day': 12,
        'facility-end-date-month': 11,
        'facility-end-date-year': 2025,
      },
      session,
    };

    await postAmendmentFacilityEndDate(req, res);

    expect(res.redirect).toHaveBeenCalledWith(
      `/case/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.dealId}/facility/${MOCK_AMENDMENT_COVERENDDATE_CHANGE.facilityId}#amendments`,
    );
  });
});
