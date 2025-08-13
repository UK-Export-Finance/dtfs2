import { DEAL_SUBMISSION_TYPE, FACILITY_TYPE, isPortalFacilityAmendmentsFeatureFlagEnabled, ACBS_FACILITY_STAGE } from '@ukef/dtfs2-common';

import { applicationDetails } from '.';
import api from '../../services/api';

import MOCKS from '../mocks';
import CONSTANTS from '../../constants';

import { getSubmittedAmendmentDetails } from '../../utils/submitted-amendment-details';
import { mapSummaryList } from '../../utils/helpers';

jest.mock('../../services/api', () => ({
  getApplication: jest.fn(),
  getFacilities: jest.fn(),
  getUserDetails: jest.fn(),
  getPortalAmendmentsOnDeal: jest.fn(),
  getTfmDeal: jest.fn(),
}));

jest.mock('../../utils/submitted-amendment-details', () => ({
  getSubmittedAmendmentDetails: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../../utils/helpers', () => ({
  ...jest.requireActual('../../utils/helpers'),
  mapSummaryList: jest.fn().mockReturnValue({}),
}));

function mockSuccessfulFlashResponse() {
  return jest.fn().mockReturnValue([{ message: 'Facility is updated' }]);
}

describe('controllers/application-details', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  let mockUserResponse;
  const mockGetPortalAmendmentsOnDealResponse = [];
  const mockGetSubmittedDetailsResponse = {
    portalAmendmentStatus: null,
    facilityIdWithAmendmentInProgress: null,
    isPortalAmendmentInProgress: false,
  };

  const MockTfmDealResponse = () => {
    return {
      dealSnapshot: {},
      tfm: {
        facilityGuaranteeDates: { effectiveDate: '2024-08-01', guaranteeCommencementDate: '2024-08-01', guaranteeExpiryDate: '2025-06-01' },
        feeRecord: null,
        riskProfile: 'Flat',
        ukefExposure: 800,
        ukefExposureCalculationTimestamp: '1722528795105',
        acbs: {
          facilities: [
            {
              facilityStage: ACBS_FACILITY_STAGE.COMMITMENT,
            },
          ],
        },
      },
    };
  };

  beforeEach(() => {
    mockResponse = MOCKS.MockResponse();
    mockRequest = MOCKS.MockRequest();
    mockApplicationResponse = MOCKS.MockApplicationResponseDraft();
    mockFacilityResponse = MOCKS.MockFacilityResponse();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();
    mockUserResponse = MOCKS.MockUserResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
    api.getPortalAmendmentsOnDeal.mockResolvedValue(mockGetPortalAmendmentsOnDealResponse);
    getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);
    api.getTfmDeal.mockResolvedValue(MockTfmDealResponse);
    mockRequest.flash = mockSuccessfulFlashResponse();
    jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Details', () => {
    describe('template rendering from amendment.status', () => {
      beforeEach(() => {
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);
      });

      it('should call the mapSummaryList function with correct parameters to render rows', async () => {
        // Arrange
        mockFacilityResponse.items = [
          {
            details: { type: FACILITY_TYPE.CASH },
            validation: { required: [] },
            createdAt: 20,
          },
          {
            details: { type: FACILITY_TYPE.CONTINGENT },
            validation: { required: [] },
            createdAt: 10,
          },
        ];

        api.getFacilities.mockResolvedValueOnce(mockFacilityResponse);

        // Act
        await applicationDetails(mockRequest, mockResponse);

        // Assert
        expect(mapSummaryList).toHaveBeenCalledTimes(3);
        expect(mapSummaryList).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Boolean));
      });
    });
  });
});
