import {
  applicationDetails,
  postApplicationDetails,
} from '.';
import api from '../../services/api';

import MOCKS from '../mocks';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

describe('controllers/application-details', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  let mockUserResponse;
  let mockEligibilityCriteriaResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponse();
    mockRequest = MOCKS.MockRequest();
    mockApplicationResponse = MOCKS.MockApplicationResponseDraft();
    mockFacilityResponse = MOCKS.MockFacilityResponse();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();
    mockUserResponse = MOCKS.MockUserResponse();
    mockEligibilityCriteriaResponse = MOCKS.MockEligibilityCriteriaResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
    api.getEligibilityCriteria.mockResolvedValue(mockEligibilityCriteriaResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Details', () => {
    it('redirects to dashboard if user is not authorised', async () => {
      mockApplicationResponse.bank = { id: 'ANOTHER_BANK' };
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await applicationDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('renders the `Application Details` template', async () => {
      mockFacilityResponse.items = [{
        details: { type: CONSTANTS.FACILITY_TYPE.CASH },
        validation: { required: [] },
        createdAt: 20,
      },
      {
        details: { type: CONSTANTS.FACILITY_TYPE.CONTINGENT },
        validation: { required: [] },
        createdAt: 10,
      }];

      api.getFacilities.mockResolvedValueOnce(mockFacilityResponse);

      await applicationDetails(mockRequest, mockResponse);
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/application-details.njk', {
          // header
          ukefDealId: mockApplicationResponse.ukefDealId,
          submissionDate: mockApplicationResponse.submissionDate,
          manualInclusionNoticeSubmissionDate: mockApplicationResponse.manualInclusionNoticeSubmissionDate,
          companyName: mockApplicationResponse.exporter.companyName,
          applicationStatus: mockApplicationResponse.status,
          dateCreated: mockApplicationResponse.createdAt,
          timezone: mockApplicationResponse.maker.timezone,
          createdBy: `${mockApplicationResponse.maker.firstname} ${mockApplicationResponse.maker.surname}`,
          comments: mockApplicationResponse.comments,
          applicationType: mockApplicationResponse.submissionType,
          submissionCount: mockApplicationResponse.submissionCount,
          activeSubNavigation: '/',

          // body
          application: {
            ...mockApplicationResponse,
            userRoles: mockRequest.session.user.roles,
          },
          status: mockApplicationResponse.status,
          isAutomaticCover: expect.any(Boolean),
          exporter: {
            rows: expect.any(Array),
            status: {
              code: expect.any(String),
              text: expect.any(String),
              class: expect.any(String),
            },
          },
          eligibility: {
            status: {
              code: expect.any(String),
              text: expect.any(String),
              class: expect.any(String),
            },
          },
          facilities: {
            data: expect.any(Array),
            status: {
              code: expect.any(String),
              text: expect.any(String),
              class: expect.any(String),
            },
          },
          supportingInfo: {
            requiredFields: expect.any(Array),
            status: {
              code: expect.any(String),
              text: expect.any(String),
              class: expect.any(String),
            },
          },
          bankInternalRefName: mockApplicationResponse.bankInternalRefName,
          additionalRefName: mockApplicationResponse.additionalRefName,
          dealId: expect.any(String),
          makerCanSubmit: expect.any(Boolean),
          makerCanReSubmit: expect.any(Boolean),
          checkerCanSubmit: expect.any(Boolean),
          link: expect.any(String),
          isUkefReviewAvailable: expect.any(Boolean),
          isUkefReviewPositive: expect.any(Boolean),
          ukefDecisionAccepted: expect.any(Boolean),
          coverDatesConfirmed: expect.any(Boolean),
          renderReviewDecisionLink: expect.any(Boolean),
          previewMode: expect.any(Boolean),
          unissuedFacilitiesPresent: expect.any(Boolean),
          facilitiesChangedToIssued: expect.any(Array),
          displayComments: expect.any(Boolean),
          hasChangedFacilities: expect.any(Boolean),
          displayChangeSupportingInfo: expect.any(Boolean),
          canUpdateUnissuedFacilities: expect.any(Boolean),
          MIAReturnToMaker: expect.any(Boolean),
          returnToMakerNoFacilitiesChanged: expect.any(Boolean),

          // actions
          submit: expect.any(Boolean),
          abandon: expect.any(Boolean),

          // user in session
          user: mockRequest.session.user,
          userRoles: mockRequest.session.user.roles,
        });
    });

    describe('template rendering from deal.status', () => {
      it('renders `application-details` when status is DRAFT', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.DRAFT;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            abandon: true,
          }));
      });

      it('renders `application-details` when status is CHANGES_REQUIRED', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is READY_FOR_APPROVAL', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
            abandon: false,
          }));
      });

      it('renders `application-preview` when status is SUBMITTED_TO_UKEF', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is ABANDONED', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.ABANDONED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_ACKNOWLEDGED', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-details` when status is IN_PROGRESS_BY_UKEF', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-details` with hasChangedFacilities as true when changed facilities present', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            hasChangedFacilities: true,
          }));
      });

      it('renders `application-details` with hasChangedFacilities as false when no changed facilities present', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            hasChangedFacilities: false,
          }));
      });

      it('renders `application-details` with displayChangeSupportingInfo as true when draft', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.DRAFT;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            displayChangeSupportingInfo: true,
          }));
      });

      it('renders `application-details` with displayChangeSupportingInfo as false when preview mode (IN_PROGRESS_BY_UKEF)', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            displayChangeSupportingInfo: false,
          }));
      });

      it('renders `application-details` with displayChangeSupportingInfo as true when the submission count is 0', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
        mockApplicationResponse.submissionCount = 0;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            displayChangeSupportingInfo: true,
          }));
      });

      it('renders `application-details` with displayChangeSupportingInfo as false submission count is 1', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
        mockApplicationResponse.submissionCount = 1;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            displayChangeSupportingInfo: false,
          }));
      });

      it('renders `application-preview` when status is UKEF_APPROVED_WITH_CONDITIONS', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_APPROVED_WITHOUT_CONDITIONS', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_REFUSED', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_REFUSED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `review-decision` when page requested is `review-decision`', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(MOCKS.MockRequestUrl('/gef/appliction/123/review-decision'), mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/review-decision.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `unissued-facilities` when page requested is `unissued facilities` ', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(MOCKS.MockRequestUrl('/gef/application/123/unissued-facilities'), mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/unissued-facilities.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
            unissuedFacilitiesPresent: false,
            facilitiesChangedToIssued: [],
          }));
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      const mockNext = jest.fn();
      api.getApplication.mockRejectedValue();

      await applicationDetails(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('POST Application Details', () => {
    it('redirects to submission url', async () => {
      postApplicationDetails(mockRequest, mockResponse);

      expect(mockResponse.redirect)
        .toHaveBeenCalledWith('/gef/application-details/123/submit');
    });
  });
});
