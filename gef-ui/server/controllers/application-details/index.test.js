import { cloneDeep } from 'lodash';
import {
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_TYPE,
  FACILITY_TYPE,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  PORTAL_AMENDMENT_STATUS,
  ROLES,
  ACBS_FACILITY_STAGE,
} from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { applicationDetails, postApplicationDetails } from '.';
import api from '../../services/api';
import { NON_MAKER_ROLES } from '../../../test-helpers/common-role-lists';

import MOCKS from '../mocks';
import CONSTANTS from '../../constants';
import { ALL_DEAL_STATUSES } from '../../../test-helpers/common-deal-status-lists';
import { getSubmittedAmendmentDetails } from '../../utils/submitted-amendment-details';

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

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
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
        'partials/application-details.njk',
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
          portalAmendmentStatus: mockGetSubmittedDetailsResponse.portalAmendmentStatus,
          isPortalAmendmentInProgress: mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress,

          // body
          application: {
            ...mockApplicationResponse,
            ...mockGetSubmittedDetailsResponse,
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
          canResubmitIssueFacilities: expect.any(Number),
          resubmitIssuedFacilities: expect.any(Array),
          displayComments: expect.any(Boolean),
          hasChangedFacilities: expect.any(Boolean),
          displayChangeSupportingInfo: expect.any(Boolean),
          canIssueFacilities: expect.any(Boolean),
          MIAReturnToMaker: expect.any(Boolean),
          returnToMakerNoFacilitiesChanged: expect.any(Boolean),
          canCloneDeal: expect.any(Boolean),

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
          'partials/application-details.njk',
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
          'partials/application-details.njk',
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
          'partials/application-details.njk',
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
          'partials/application-details.njk',
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
          'partials/application-details.njk',
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
          'partials/application-details.njk',
          expect.objectContaining({
            displayChangeSupportingInfo: false,
          }),
        );
      });

      it(`renders 'application-preview' with canIssuedFacilitiesBeAmended=true when the deal status is ${DEAL_STATUS.UKEF_ACKNOWLEDGED}, the submission type is valid and there are no amendments in progress on the facility`, async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseIssued);
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: true,
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' with the canIssuedFacilitiesBeAmended=false when the deal status is not ${DEAL_STATUS.UKEF_ACKNOWLEDGED}`, async () => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' without canIssuedFacilitiesBeAmended when the deal status is ${DEAL_STATUS.CANCELLED}`, async () => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = DEAL_STATUS.CANCELLED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.not.objectContaining({
                  canIssuedFacilitiesBeAmended: expect.any(Boolean),
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' with canIssuedFacilitiesBeAmended=false when the submission type is ${DEAL_SUBMISSION_TYPE.MIA}`, async () => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.MIA;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' with canIssuedFacilitiesBeAmended=false when the user type is not ${ROLES.MAKER}`, async () => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        const mockCheckerRequest = MOCKS.MockRequestChecker();
        mockCheckerRequest.flash = mockSuccessfulFlashResponse();

        await applicationDetails(mockCheckerRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' with canIssuedFacilitiesBeAmended=false when deal cancellation is not enabled`, async () => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(false);

        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                }),
              ]),
            }),
          }),
        );
      });

      it(`renders 'application-preview' with canIssuedFacilitiesBeAmended=false when there is an amendment already in progress on the facility`, async () => {
        api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponseNotChangedIssued);
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([aPortalFacilityAmendment()]);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                }),
              ]),
            }),
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
          'partials/review-decision.njk',
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
          'partials/unissued-facilities.njk',
          expect.objectContaining({
            applicationStatus: mockApplicationResponse.status,
            unissuedFacilitiesPresent: false,
            canResubmitIssueFacilities: 0,
            resubmitIssuedFacilities: [],
          }),
        );
      });
    });

    describe('template rendering from amendment.status', () => {
      beforeEach(() => {
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        mockApplicationResponse.status = CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(true);
      });

      const portalAmendmentTestCases = [
        {
          template: `application-preview`,
          label: PORTAL_AMENDMENT_STATUS.DRAFT,
          isPortalAmendmentInProgress: false,
          portalAmendmentStatus: null,
          expectObjectContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: true,
                }),
              ]),
            }),
          },
          expectObjectNotContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.not.objectContaining({
                  isFacilityWithAmendmentInProgress: expect.any(Object),
                  amendmentDetailsUrl: expect.any(String),
                }),
              ]),
            }),
          },
        },
        {
          template: `application-preview`,
          label: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
          isPortalAmendmentInProgress: true,
          portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
          expectObjectContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                  isFacilityWithAmendmentInProgress: expect.any(Object),
                  amendmentDetailsUrl: expect.any(String),
                }),
              ]),
            }),
          },
        },
        {
          template: `application-preview`,
          label: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
          isPortalAmendmentInProgress: true,
          portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
          expectObjectContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                  isFacilityWithAmendmentInProgress: expect.any(Object),
                  amendmentDetailsUrl: expect.any(String),
                }),
              ]),
            }),
          },
        },
        {
          template: `application-preview`,
          label: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          isPortalAmendmentInProgress: false,
          portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
          expectObjectContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: true,
                }),
              ]),
            }),
          },
          expectObjectNotContaining: {
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.not.objectContaining({
                  isFacilityWithAmendmentInProgress: expect.any(Object),
                  amendmentDetailsUrl: expect.any(String),
                }),
              ]),
            }),
          },
        },
      ];

      it.each(portalAmendmentTestCases)(
        'should render `$template` when portalAmendmentStatus is $label',
        async ({ template, isPortalAmendmentInProgress, portalAmendmentStatus, expectObjectContaining, expectObjectNotContaining }) => {
          mockGetSubmittedDetailsResponse.portalAmendmentStatus = portalAmendmentStatus;
          mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = isPortalAmendmentInProgress;
          getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

          let amendmentsOnDealReturn = [];

          if (isPortalAmendmentInProgress) {
            amendmentsOnDealReturn = [{ ...aPortalFacilityAmendment({ status: portalAmendmentStatus }), facilityId: '1234' }];
          }

          api.getPortalAmendmentsOnDeal.mockResolvedValueOnce(amendmentsOnDealReturn);

          await applicationDetails(mockRequest, mockResponse);

          expect(mockResponse.render).toHaveBeenCalledWith(`partials/${template}.njk`, expect.objectContaining(expectObjectContaining));

          if (expectObjectNotContaining) {
            expect(mockResponse.render).toHaveBeenCalledWith(`partials/${template}.njk`, expect.objectContaining(expectObjectNotContaining));
          }
        },
      );

      it('should render `application-preview` with facilityIdWithAmendmentInProgress as true when amendment is in progress', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = '1234';

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([
          { ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL }), facilityId: '1234' },
        ]);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: false,
                  isFacilityWithAmendmentInProgress: expect.any(Object),
                  amendmentDetailsUrl: expect.any(String),
                }),
              ]),
            }),
          }),
        );
      });

      it('should render `application-preview` with cancelledDealWithAmendments as true when amendment is in progress and deal is cancelled', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = '1234';

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        mockApplicationResponse.status = DEAL_STATUS.CANCELLED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([
          { ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL }), facilityId: '1234' },
        ]);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            cancelledDealWithAmendments: true,
          }),
        );
      });

      it('should render `application-preview` with cancelledDealWithAmendments as false when amendment is not in progress and deal is cancelled', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = '1234';

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([]);

        mockApplicationResponse.status = DEAL_STATUS.CANCELLED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.not.objectContaining({
            cancelledDealWithAmendments: expect.any(Boolean),
          }),
        );
      });

      it('should render `application-preview` with facilityIdWithAmendmentInProgress as false when amendment is not in progress', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = 'other-id';

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([
          { ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }), facilityId: '1234' },
        ]);

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  canIssuedFacilitiesBeAmended: true,
                }),
              ]),
            }),
          }),
        );
      });

      it('should render `application-preview` with amendment status row and a status tag when amendment is acknowledged', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = 'other-id';

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([
          { ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }), facilityId: '1234' },
        ]);

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        const facilityId = MOCKS.MockFacilityResponse().items[0].details._id;

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  rows: expect.arrayContaining([
                    expect.objectContaining({
                      key: expect.objectContaining({ text: 'Amendment status' }),
                      value: {
                        html: `<strong class="govuk-tag govuk-tag--green" data-cy="amendment-status-${facilityId}">${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}</strong>`,
                      },
                    }),
                  ]),
                }),
              ]),
            }),
          }),
        );
      });

      it('should render `application-preview` with amendment status row and a status tag when amendment is in progress', async () => {
        mockGetSubmittedDetailsResponse.portalAmendmentStatus = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = true;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = 'other-id';

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([
          { ...aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL }), facilityId: '1234' },
        ]);

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        const facilityId = MOCKS.MockFacilityResponse().items[0].details._id;

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  rows: expect.arrayContaining([
                    expect.objectContaining({
                      key: expect.objectContaining({ text: 'Amendment status' }),
                      value: {
                        html: `<strong class="govuk-tag govuk-tag--blue" data-cy="amendment-status-${facilityId}">${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}</strong>`,
                      },
                    }),
                  ]),
                }),
              ]),
            }),
          }),
        );
      });

      it('should render `application-preview` without the amendment status row and a status tag when amendment is not in progress', async () => {
        mockGetSubmittedDetailsResponse.isPortalAmendmentInProgress = false;
        mockGetSubmittedDetailsResponse.facilityIdWithAmendmentInProgress = null;

        api.getPortalAmendmentsOnDeal.mockResolvedValueOnce([]);

        getSubmittedAmendmentDetails.mockResolvedValue(mockGetSubmittedDetailsResponse);

        mockApplicationResponse.status = DEAL_STATUS.UKEF_ACKNOWLEDGED;
        mockApplicationResponse.submissionType = DEAL_SUBMISSION_TYPE.AIN;
        api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

        await applicationDetails(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'partials/application-preview.njk',
          expect.objectContaining({
            facilities: expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  rows: expect.arrayContaining([
                    expect.not.objectContaining({
                      key: expect.objectContaining({ text: expect.any(String) }),
                      value: {
                        html: expect.any(String),
                      },
                    }),
                  ]),
                }),
              ]),
            }),
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
