import { DEAL_STATUS, DEAL_TYPE, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { applicationDetails, postApplicationDetails } from '.';
import api from '../../services/api';
import { NON_MAKER_ROLES } from '../../../test-helpers/common-role-lists';

import MOCKS from '../mocks';
import CONSTANTS from '../../constants';
import { ALL_DEAL_STATUSES } from '../../../test-helpers/common-deal-status-lists';

const { cloneDeep } = require('lodash');

jest.mock('../../services/api');

describe('controllers/application-details', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  let mockUserResponse;

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
    mockRequest.flash = mockSuccessfulFlashResponse();
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
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('redirects to problem with service page if the deal is not GEF', async () => {
      mockApplicationResponse.dealType = DEAL_TYPE.BSS_EWCS;
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
      await applicationDetails(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('renders the `Application Details` template', async () => {
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

      await applicationDetails(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith(
        '_partials/application-details.njk',
        expect.objectContaining({
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
        }),
      );
    });

    describe('template rendering from deal.status', () => {
      const templateRenderingTestCases = [
        {
          template: `application-details`,
          status: DEAL_STATUS.DRAFT,
          expectObjectContaining: { abandon: true },
        },
        {
          template: `application-details`,
          status: DEAL_STATUS.CHANGES_REQUIRED,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.CHANGES_REQUIRED },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.READY_FOR_APPROVAL,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.READY_FOR_APPROVAL, abandon: false },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.SUBMITTED_TO_UKEF,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.SUBMITTED_TO_UKEF },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.ABANDONED,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.ABANDONED },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.UKEF_ACKNOWLEDGED,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.UKEF_ACKNOWLEDGED },
        },
        {
          template: `application-details`,
          status: DEAL_STATUS.IN_PROGRESS_BY_UKEF,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.IN_PROGRESS_BY_UKEF },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.UKEF_REFUSED,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.UKEF_REFUSED },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.CANCELLED,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.CANCELLED },
        },
        {
          template: `application-preview`,
          status: DEAL_STATUS.PENDING_CANCELLATION,
          expectObjectContaining: { applicationStatus: DEAL_STATUS.PENDING_CANCELLATION },
        },
      ];

      it.each(templateRenderingTestCases)('renders `$template` when status is $status', async ({ template, status, expectObjectContaining }) => {
        mockApplicationResponse.status = status;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(`partials/${template}.njk`, expect.objectContaining(expectObjectContaining));
      });

      it('renders `application-details` with hasChangedFacilities as true when changed facilities present', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            hasChangedFacilities: true,
          }),
        );
      });

      it('renders `application-details` with hasChangedFacilities as false when no changed facilities present', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            hasChangedFacilities: false,
          }),
        );
      });

      it('renders `application-details` with displayChangeSupportingInfo as true when draft', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.DRAFT;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            displayChangeSupportingInfo: true,
          }),
        );
      });

      it('renders `application-details` with displayChangeSupportingInfo as false when preview mode (IN_PROGRESS_BY_UKEF)', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS_BY_UKEF;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            displayChangeSupportingInfo: false,
          }),
        );
      });

      it('renders `application-details` with displayChangeSupportingInfo as true when the submission count is 0', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
        mockApplicationResponse.submissionCount = 0;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            displayChangeSupportingInfo: true,
          }),
        );
      });

      it('renders `application-details` with displayChangeSupportingInfo as false submission count is 1', async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED;
        mockApplicationResponse.submissionCount = 1;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/application-details.njk',
          expect.objectContaining({
            displayChangeSupportingInfo: false,
          }),
        );
      });

      it('renders `review-decision` when page requested is `review-decision`', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
        const req = {
          ...MOCKS.MockRequestUrl('/gef/application/123/review-decision'),
          flash: mockSuccessfulFlashResponse(),
        };
        await applicationDetails(req, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/review-decision.njk',
          expect.objectContaining({ applicationStatus: mockApplicationResponse.status }),
        );
      });

      it('renders `unissued-facilities` when page requested is `unissued facilities` ', async () => {
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
        const req = {
          ...MOCKS.MockRequestUrl('/gef/application/123/unissued-facilities'),
          flash: mockSuccessfulFlashResponse(),
        };
        await applicationDetails(req, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          '_partials/unissued-facilities.njk',
          expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
            unissuedFacilitiesPresent: false,
            facilitiesChangedToIssued: [],
          }),
        );
      });
    });

    describe('params', () => {
      describe('Success', () => {
        it('when a success message is present and req.flash is not present in request it passes the success message from the request to the template', async () => {
          // Arrange
          const testReq = cloneDeep(mockRequest);
          testReq.success = { message: 'Success message' };
          testReq.flash = mockUnsuccessfulFlashResponse();
          // Act
          await applicationDetails(testReq, mockResponse);
          // Assert
          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              success: { message: 'Success message' },
            }),
          );
        });

        it('when a success message is present and req.flash is present in request it passes the req.flash success message to template', async () => {
          // Arrange
          const testReq = cloneDeep(mockRequest);
          testReq.success = { message: 'Success message' };
          testReq.flash = mockSuccessfulFlashResponse();

          // Act
          await applicationDetails(testReq, mockResponse);

          // Assert
          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              success: {
                message: 'Facility is updated',
              },
            }),
          );
        });

        it('when a success message is not present and req.flash is present in request it passes the req.flash success message to template', async () => {
          // Arrange
          const testReq = cloneDeep(mockRequest);
          testReq.success = [];
          testReq.flash = mockSuccessfulFlashResponse();

          // Act
          await applicationDetails(testReq, mockResponse);

          // Assert
          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              success: {
                message: 'Facility is updated',
              },
            }),
          );
        });

        it('when neither success messages are present in request it does not pass on a success message to template template', async () => {
          // Arrange
          const testReq = cloneDeep(mockRequest);
          testReq.success = [];
          testReq.flash = mockUnsuccessfulFlashResponse();

          // Act
          await applicationDetails(testReq, mockResponse);

          // Assert
          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.not.objectContaining({
              success: expect.any(String),
            }),
          );
        });
      });
      describe('abandon', () => {
        const statusesThatAllowDealToBeAbandoned = [CONSTANTS.DEAL_STATUS.DRAFT, CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED];
        const statusesThatDoNotAllowDealToBeAbandoned = ALL_DEAL_STATUSES.filter((status) => !statusesThatAllowDealToBeAbandoned.includes(status));

        it.each(NON_MAKER_ROLES)('is false if the user has the %s role (and not the maker role)', async (role) => {
          const [aStatusThatAllowsDealToBeAbandoned] = statusesThatAllowDealToBeAbandoned;
          mockApplicationResponse.status = aStatusThatAllowsDealToBeAbandoned;
          api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
          mockRequest.session.user.roles = [role];

          await applicationDetails(mockRequest, mockResponse);

          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              abandon: false,
            }),
          );
        });

        it.each(statusesThatAllowDealToBeAbandoned)('is true if the user has the maker role and the deal is in %s status', async (status) => {
          mockApplicationResponse.status = status;
          api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
          mockRequest.session.user.roles = [CONSTANTS.ROLES.MAKER];

          await applicationDetails(mockRequest, mockResponse);

          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              abandon: true,
            }),
          );
        });

        it.each(statusesThatDoNotAllowDealToBeAbandoned)('is false if the user has the maker role and the deal is in %s status', async (status) => {
          mockApplicationResponse.status = status;
          api.getApplication.mockResolvedValueOnce(mockApplicationResponse);
          mockRequest.session.user.roles = [CONSTANTS.ROLES.MAKER];

          await applicationDetails(mockRequest, mockResponse);

          expect(mockResponse.render).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              abandon: false,
            }),
          );
        });
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

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/1234567890abcdf123456789/submit');
    });
  });

  function mockSuccessfulFlashResponse() {
    return jest.fn().mockReturnValue([{ message: 'Facility is updated' }]);
  }
  function mockUnsuccessfulFlashResponse() {
    return jest.fn().mockReturnValue([]);
  }
});
