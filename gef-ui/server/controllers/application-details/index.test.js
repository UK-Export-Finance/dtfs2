import {
  applicationDetails,
  postApplicationDetails,
} from '.';
import api from '../../services/api';

import mocks from '../mocks';

jest.mock('../../services/api');

describe('controllers/application-detaills', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockExporterResponse;
  let mockFacilityResponse;
  let mockUserResponse;
  let mockEligibilityCriteriaResponse;

  beforeEach(() => {
    mockResponse = mocks.MockResponse();
    mockRequest = mocks.MockRequest();
    mockApplicationResponse = mocks.MockApplicationResponseDraft();
    mockExporterResponse = mocks.MockExporterResponse();
    mockFacilityResponse = mocks.MockFacilityResponse();
    mockUserResponse = mocks.MockUserResponse();
    mockEligibilityCriteriaResponse = mocks.MockEligibilityCriteriaResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getEligibilityCriteria.mockResolvedValue(mockEligibilityCriteriaResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Details', () => {
    it('redirects to dashboard if user is not authorised', async () => {
      mockApplicationResponse.bankId = 'ANOTHER_BANK';
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await applicationDetails(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalled();
    });

    it('should call get user API to get maker details', async () => {
      await applicationDetails(mockRequest, mockResponse);

      expect(api.getUserDetails).toHaveBeenCalledWith(
        mockApplicationResponse.userId,
        mockRequest.session.userToken,
      );
    });

    it('renders the `Application Details` template', async () => {
      mockFacilityResponse.items = [{
        details: { type: 'CASH' },
        validation: { required: [] },
        createdAt: 20,
      },
      {
        details: { type: 'CONTINGENT' },
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
          companyName: mockExporterResponse.details.companyName,
          applicationStatus: mockApplicationResponse.status,
          dateCreated: mockApplicationResponse.createdAt,
          timezone: mockUserResponse.timezone,
          createdBy: `${mockUserResponse.firstname} ${mockUserResponse.surname}`,
          comments: mockApplicationResponse.comments,
          applicationType: mockApplicationResponse.submissionType,
          submissionCount: mockApplicationResponse.submissionCount,
          activeSubNavigation: '/',

          // body
          application: {
            ...mockApplicationResponse,
            maker: mockUserResponse,
          },
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
          applicationId: expect.any(String),
          makerCanSubmit: expect.any(Boolean),
          checkerCanSubmit: expect.any(Boolean),
          isUkefReviewAvailable: expect.any(Boolean),
          isUkefReviewPositive: expect.any(Boolean),
          ukefDecisionAccepted: expect.any(Boolean),
          previewMode: expect.any(Boolean),

          // actions
          submit: expect.any(Boolean),
          abandon: expect.any(Boolean),

          // user in session
          user: mockRequest.session.user,
        });
    });

    describe('template rendering from deal.status', () => {
      it('renders `application-details` when status is DRAFT', async () => {
        mockApplicationResponse.status = 'DRAFT';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            abandon: true,
          }));
      });

      it('renders `application-details` when status is CHANGES_REQUIRED', async () => {
        mockApplicationResponse.status = 'CHANGES_REQUIRED';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is BANK_CHECK', async () => {
        mockApplicationResponse.status = 'BANK_CHECK';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
            abandon: false,
          }));
      });

      it('renders `application-preview` when status is SUBMITTED_TO_UKEF', async () => {
        mockApplicationResponse.status = 'SUBMITTED_TO_UKEF';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is ABANDONED', async () => {
        mockApplicationResponse.status = 'ABANDONED';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_ACKNOWLEDGED', async () => {
        mockApplicationResponse.status = 'UKEF_ACKNOWLEDGED';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-details` when status is UKEF_IN_PROGRESS', async () => {
        mockApplicationResponse.status = 'UKEF_IN_PROGRESS';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_APPROVED_WITH_CONDITIONS', async () => {
        mockApplicationResponse.status = 'UKEF_APPROVED_WITH_CONDITIONS';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_APPROVED_WITHOUT_CONDITIONS', async () => {
        mockApplicationResponse.status = 'UKEF_APPROVED_WITHOUT_CONDITIONS';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `application-preview` when status is UKEF_REFUSED', async () => {
        mockApplicationResponse.status = 'UKEF_REFUSED';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
          }));
      });

      it('renders `review-decision` when page requested is `review-decision` ', async () => {
        mockApplicationResponse.status = 'UKEF_APPROVED_WITHOUT_CONDITIONS';
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mocks.MockRequestUrl('/gef/appliction/123/review-decision'), mockResponse);

        expect(mockResponse.render)
          .toHaveBeenCalledWith('partials/review-decision.njk', expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
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
