import { PortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { PortalFacilityAmendmentService } from './facility-amendment.service';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn();

const today = new Date();

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

  describe('generatePortalFacilityAmendment', () => {
    const testCases: {
      description: string;
      amendment: PortalFacilityAmendmentUserValues;
      expectedResult: PortalFacilityAmendmentUserValues;
    }[] = [
      {
        description: 'when changeCoverEndDate is false it should set cover end date section to null',
        amendment: {
          changeCoverEndDate: false,
        },
        expectedResult: {
          changeCoverEndDate: false,
          coverEndDate: null,
          isUsingFacilityEndDate: null,
          bankReviewDate: null,
          facilityEndDate: null,
        },
      },
      {
        description: 'when coverEndDate is set it should set changeCoverEndDate to true',
        amendment: {
          coverEndDate: today.valueOf(),
        },
        expectedResult: {
          coverEndDate: today.valueOf(),
          changeCoverEndDate: true,
        },
      },
      {
        description: 'when isUsingFacilityEndDate is true it should set changeCoverEndDate to true and bankReviewDate to null',
        amendment: {
          isUsingFacilityEndDate: true,
        },
        expectedResult: {
          isUsingFacilityEndDate: true,
          changeCoverEndDate: true,
          bankReviewDate: null,
        },
      },
      {
        description: 'when facilityEndDate is set it should set changeCoverEndDate to true, isUsingFacilityEndDate to true and bankReviewDate to null',
        amendment: {
          facilityEndDate: today,
        },
        expectedResult: {
          facilityEndDate: today,
          isUsingFacilityEndDate: true,
          changeCoverEndDate: true,
          bankReviewDate: null,
        },
      },
      {
        description: 'when isUsingFacilityEndDate is false it should set changeCoverEndDate to true and facilityEndDate to null',
        amendment: {
          isUsingFacilityEndDate: false,
        },
        expectedResult: {
          isUsingFacilityEndDate: false,
          changeCoverEndDate: true,
          facilityEndDate: null,
        },
      },
      {
        description: 'when bankReviewDate is set it should set changeCoverEndDate to true, isUsingFacilityEndDate to false and facilityEndDate to null',
        amendment: {
          bankReviewDate: today,
        },
        expectedResult: {
          bankReviewDate: today,
          isUsingFacilityEndDate: false,
          changeCoverEndDate: true,
          facilityEndDate: null,
        },
      },
      {
        description: 'when changeFacilityValue is false it should set value to null',
        amendment: {
          changeFacilityValue: false,
        },
        expectedResult: {
          changeFacilityValue: false,
          value: null,
        },
      },
      {
        description: 'when value is set it should set changeFacilityValue to true',
        amendment: {
          value: 100,
        },
        expectedResult: {
          changeFacilityValue: true,
          value: 100,
        },
      },
      {
        description: 'when all values are provided it should return the amendment',
        amendment: aPortalFacilityAmendmentUserValues(),
        expectedResult: aPortalFacilityAmendmentUserValues(),
      },
    ];

    it.each(testCases)('$description', ({ amendment, expectedResult }) => {
      // Act
      const result = PortalFacilityAmendmentService.generatePortalFacilityAmendment(amendment);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
