import { AMENDMENT_TYPES, AmendmentIncompleteError, AmendmentNotFoundError, getEpochMs, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { aCompletedPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();

const amendmentId = new ObjectId().toString();
const facilityId = new ObjectId().toString();

describe('PortalFacilityAmendmentService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockFindOneAmendmentByFacilityIdAndAmendmentId);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('validateAmendmentIsComplete', () => {
    it('should call TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId with the correct params', async () => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(aCompletedPortalFacilityAmendment());

      // Act
      await PortalFacilityAmendmentService.validateAmendmentIsComplete({ amendmentId, facilityId });

      // Assert
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(1);
      expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(facilityId, amendmentId);
    });

    it('should throw an AmendmentNotFoundError if no amendment is found when calling TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId', async () => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(null);

      // Act
      const returned = PortalFacilityAmendmentService.validateAmendmentIsComplete({ amendmentId, facilityId });

      // Assert
      await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
    });

    it(`should throw an AmendmentNotFoundError if an amendment without a ${AMENDMENT_TYPES.PORTAL} amendment type is returned from TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId`, async () => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce({ ...aCompletedPortalFacilityAmendment(), type: AMENDMENT_TYPES.TFM });

      // Act
      const returned = PortalFacilityAmendmentService.validateAmendmentIsComplete({ amendmentId, facilityId });

      // Assert
      await expect(returned).rejects.toThrow(new AmendmentNotFoundError(amendmentId, facilityId));
    });

    const AmendmentIncompleteTestCases: {
      description: string;
      amendment: PortalFacilityAmendment;
      expectedErrorMessage: string;
    }[] = [
      {
        description: 'neither changeCoverEndDate nor changeFacilityValue is true',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: false,
          changeFacilityValue: false,
        },
        expectedErrorMessage: 'neither changeCoverEndDate nor changeFacilityValue is true',
      },
      {
        description: 'changeCoverEndDate is false but coverEndDate is provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: false,
          coverEndDate: getEpochMs(),
          isUsingFacilityEndDate: null,
          facilityEndDate: null,
          bankReviewDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is false but cover end date values are provided',
      },
      {
        description: 'changeCoverEndDate is false but isUsingFacilityEndDate is provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: false,
          isUsingFacilityEndDate: true,
          coverEndDate: null,
          facilityEndDate: null,
          bankReviewDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is false but cover end date values are provided',
      },
      {
        description: 'changeCoverEndDate is false but bankReviewDate is provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: false,
          bankReviewDate: new Date(),
          coverEndDate: null,
          isUsingFacilityEndDate: null,
          facilityEndDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is false but cover end date values are provided',
      },
      {
        description: 'changeCoverEndDate is false but facilityEndDate is provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: false,
          changeFacilityValue: true,
          facilityEndDate: new Date(),
          coverEndDate: null,
          isUsingFacilityEndDate: null,
          bankReviewDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is false but cover end date values are provided',
      },
      {
        description: 'changeCoverEndDate is true but coverEndDate is not provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: true,
          coverEndDate: null,
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date(),
          facilityEndDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is true but cover end date section incomplete',
      },
      {
        description: 'changeCoverEndDate is true, isUsingFacilityEndDate is false but bankReviewDate is not provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: true,
          coverEndDate: getEpochMs(),
          isUsingFacilityEndDate: false,
          bankReviewDate: null,
          facilityEndDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is true but cover end date section incomplete',
      },
      {
        description: 'changeCoverEndDate and isUsingFacilityEndDate are true but facilityEndDate is not provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: true,
          coverEndDate: getEpochMs(),
          isUsingFacilityEndDate: true,
          facilityEndDate: null,
          bankReviewDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is true but cover end date section incomplete',
      },
      {
        description: 'changeCoverEndDate is true but isUsingFacilityEndDate is not provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeCoverEndDate: true,
          coverEndDate: getEpochMs(),
          isUsingFacilityEndDate: null,
          bankReviewDate: new Date(),
          facilityEndDate: null,
        },
        expectedErrorMessage: 'changeCoverEndDate is true but cover end date section incomplete',
      },
      {
        description: 'changeFacilityValue is false but value provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeFacilityValue: false,
          value: 1000,
        },
        expectedErrorMessage: 'changeFacilityValue is false but value provided',
      },
      {
        description: 'changeFacilityValue is true but a value has not been provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          changeFacilityValue: true,
          value: null,
        },
        expectedErrorMessage: 'changeFacilityValue is true but a value has not been provided',
      },
      {
        description: 'effectiveDate not provided',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          effectiveDate: undefined,
        },
        expectedErrorMessage: 'effectiveDate not provided',
      },
      {
        description: 'eligibilityCriteria contains a false answer',
        amendment: {
          ...aCompletedPortalFacilityAmendment(),
          eligibilityCriteria: {
            criteria: [
              { id: 1, text: 'item 1', answer: false },
              { id: 2, text: 'item 2', answer: true },
            ],
            version: 1,
          },
        },
        expectedErrorMessage: 'eligibilityCriteria answers are not all true',
      },
    ];

    it.each(AmendmentIncompleteTestCases)('should throw an AmendmentIncompleteError if $description', async ({ amendment, expectedErrorMessage }) => {
      // Arrange
      mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValueOnce(amendment);

      // Act
      const returned = PortalFacilityAmendmentService.validateAmendmentIsComplete({ amendmentId, facilityId });

      // Assert
      await expect(returned).rejects.toThrow(new AmendmentIncompleteError(facilityId, amendmentId, expectedErrorMessage));
    });
  });
});
