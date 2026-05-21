import { Role, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_AMENDMENT_STATUS, now, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { add } from 'date-fns';
import { mapFacilityApplicationDetails } from './map-facility-application-details';
import { addAmendmentParamsToFacility } from './add-amendment-params-to-facility';
import { MOCK_ISSUED_FACILITY } from '../utils/mocks/mock-facilities';
import { MOCK_MAKER } from '../utils/mocks/mock-users';
import { MOCK_BASIC_DEAL } from '../utils/mocks/mock-applications';
import { SubmittedAmendmentsParams } from '../types/portal-amendments';

jest.mock('@ukef/dtfs2-common', (): typeof import('@ukef/dtfs2-common') => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

describe('mapFacilityApplicationDetails', () => {
  const facility = {
    ...MOCK_ISSUED_FACILITY.details,
    stage: 'Issued',
    facilityId: 'facility-1',
    canResubmitIssuedFacilities: false,
  };

  const facilityTwo = {
    ...facility,
    facilityId: 'facility-2',
  };

  const amendmentReadyForChecker = {
    amendmentId: 'amendment-1',
    facilityId: facility.facilityId,
    status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
    effectiveDate: add(now(), { days: 1 }),
  };

  const amendmentFurtherMakersInput = {
    amendmentId: 'amendment-1',
    facilityId: facilityTwo.facilityId,
    status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
    effectiveDate: now(),
  };

  const params = {
    readyForCheckerAmendmentDetailsUrlAndText: [],
    furtherMakersInputAmendmentDetailsUrlAndText: [],
    hasReadyForCheckerAmendments: false,
    hasFurtherMakersInputAmendments: false,
  };

  const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED, submissionCount: 1 };

  describe('when the deal is cancelled', () => {
    it('should not populate params and should not populate canIssuedFacilitiesBeAmended', () => {
      // Arrange
      const onGoingAmendments: SubmittedAmendmentsParams[] = [];

      const cancelledDeal = {
        ...mockDeal,
        status: DEAL_STATUS.CANCELLED,
      };

      // Act
      const response = mapFacilityApplicationDetails(cancelledDeal, [facility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

      const expected = {
        mappedFacilities: [facility],
        facilityParams: params,
      };

      expect(response).toEqual(expected);
    });
  });

  describe('when the deal is pending cancellation', () => {
    it('should not populate params and should not populate canIssuedFacilitiesBeAmended', () => {
      // Arrange
      const amendmentsInProgress: SubmittedAmendmentsParams[] = [];

      const cancelledDeal = {
        ...mockDeal,
        status: DEAL_STATUS.PENDING_CANCELLATION,
      };

      // Act
      const response = mapFacilityApplicationDetails(cancelledDeal, [facility], amendmentsInProgress, params, MOCK_MAKER.roles as Role[]);

      const expected = {
        mappedFacilities: [facility],
        facilityParams: params,
      };

      expect(response).toEqual(expected);
    });
  });

  describe('when there are no on going amendments', () => {
    beforeEach(() => {
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(false);
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is false', () => {
      describe('when a facility is issued', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to false', () => {
          // Arrange
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [facility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...facility,
                canIssuedFacilitiesBeAmended: false,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });

      describe('when a facility is unissued', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to false', () => {
          // Arrange
          const unissuedFacility = {
            ...facility,
            stage: 'Unissued',
          };
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [unissuedFacility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...unissuedFacility,
                canIssuedFacilitiesBeAmended: false,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });

      describe('when a facility has changed to issued but not yet been submitted to UKEF', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to false', () => {
          // Arrange
          const unissuedFacility = {
            ...facility,
            stage: 'Issued',
            canIssuedFacilitiesBeAmended: true,
          };
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [unissuedFacility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...unissuedFacility,
                canIssuedFacilitiesBeAmended: false,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });
    });

    describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is true', () => {
      beforeEach(() => {
        jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValue(true);
      });

      describe('when a facility is issued', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to true', () => {
          // Arrange
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [facility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...facility,
                canIssuedFacilitiesBeAmended: true,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });

      describe('when a facility is unissued', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to true', () => {
          // Arrange
          const unissuedFacility = {
            ...facility,
            stage: 'Unissued',
          };
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [unissuedFacility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...unissuedFacility,
                canIssuedFacilitiesBeAmended: false,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });

      describe('when a facility is changed to issued', () => {
        it('should return mapped facilities with canIssuedFacilitiesBeAmended set to false', () => {
          // Arrange
          const changedToIssuedFacility = {
            ...facility,
            canResubmitIssuedFacilities: true,
          };
          const onGoingAmendments: SubmittedAmendmentsParams[] = [];

          // Act
          const response = mapFacilityApplicationDetails(mockDeal, [changedToIssuedFacility], onGoingAmendments, params, MOCK_MAKER.roles as Role[]);

          // Assert
          const expected = {
            mappedFacilities: [
              {
                ...changedToIssuedFacility,
                canIssuedFacilitiesBeAmended: false,
              },
            ],
            facilityParams: params,
          };

          expect(response).toEqual(expected);
        });
      });
    });
  });

  describe('when there are amendments in progress', () => {
    it('should return mapped facilities and params fully populated', () => {
      // Arrange
      const submittedAmendments: SubmittedAmendmentsParams[] = [amendmentReadyForChecker, amendmentFurtherMakersInput];

      // Act
      const response = mapFacilityApplicationDetails(mockDeal, [facility, facilityTwo], submittedAmendments, params, MOCK_MAKER.roles as Role[]);

      // Assert
      const {
        mappedFacility: mappedFacility1,
        furtherMakersInputAmendmentDetailsUrlAndText,
        hasFurtherMakersInputAmendments,
      } = addAmendmentParamsToFacility({
        facility,
        dealId: mockDeal._id,
        userRoles: MOCK_MAKER.roles,
        isFacilityWithAmendmentInProgress: submittedAmendments[0],
        readyForCheckerAmendmentDetailsUrlAndText: params.readyForCheckerAmendmentDetailsUrlAndText,
        furtherMakersInputAmendmentDetailsUrlAndText: params.furtherMakersInputAmendmentDetailsUrlAndText,
      });

      const {
        mappedFacility: mappedFacility2,
        readyForCheckerAmendmentDetailsUrlAndText,
        hasReadyForCheckerAmendments,
      } = addAmendmentParamsToFacility({
        facility: facilityTwo,
        dealId: mockDeal._id,
        userRoles: MOCK_MAKER.roles,
        isFacilityWithAmendmentInProgress: submittedAmendments[1],
        readyForCheckerAmendmentDetailsUrlAndText: params.readyForCheckerAmendmentDetailsUrlAndText,
        furtherMakersInputAmendmentDetailsUrlAndText: params.furtherMakersInputAmendmentDetailsUrlAndText,
      });

      const updatedParams = {
        readyForCheckerAmendmentDetailsUrlAndText,
        furtherMakersInputAmendmentDetailsUrlAndText,
        hasReadyForCheckerAmendments,
        hasFurtherMakersInputAmendments,
      };

      const expected = {
        mappedFacilities: [
          {
            ...mappedFacility1,
            canIssuedFacilitiesBeAmended: false,
          },
          {
            ...mappedFacility2,
            canIssuedFacilitiesBeAmended: false,
          },
        ],
        facilityParams: updatedParams,
      };

      expect(response).toEqual(expected);
    });
  });
});
