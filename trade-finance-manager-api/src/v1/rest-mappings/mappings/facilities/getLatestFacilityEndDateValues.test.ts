import { ObjectId } from 'mongodb';
import { Facility, TfmFacility } from '@ukef/dtfs2-common';
import { generateMockTfmUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { getLatestFacilityEndDateValues } from './getLatestFacilityEndDateValues.ts';
import { MOCK_FACILITY_SNAPSHOT } from '../../../__mocks__/mock-facility-snapshot.ts';
import { MOCK_AMENDMENT } from '../../../__mocks__/mock-amendment';

describe('getLatestFacilityEndDateValues', () => {
  const facility: TfmFacility = {
    _id: new ObjectId('1234567890abcdef12345678'),
    facilitySnapshot: MOCK_FACILITY_SNAPSHOT,
    tfm: {},
    auditRecord: generateMockTfmUserAuditDatabaseRecord(new ObjectId()),
  };

  const mockFacilityEndDate = new Date('2024-04-04');
  const mockBankReviewDate = new Date('2025-05-05');

  const facilitySnapshotWithFacilityEndDate: Facility = {
    ...MOCK_FACILITY_SNAPSHOT,
    isUsingFacilityEndDate: true,
    facilityEndDate: mockFacilityEndDate,
    bankReviewDate: undefined,
  };

  const facilitySnapshotWithBankReviewDate: Facility = {
    ...MOCK_FACILITY_SNAPSHOT,
    isUsingFacilityEndDate: false,
    bankReviewDate: mockBankReviewDate,
    facilityEndDate: undefined,
  };

  describe('when there are amendments', () => {
    it('should return the values from the facility snapshot when no amendments update the FED values', () => {
      // Arrange
      const facilityWithAmendments: TfmFacility = {
        ...facility,
        facilitySnapshot: facilitySnapshotWithFacilityEndDate,
        amendments: [
          { ...MOCK_AMENDMENT, updatedAt: 1723653111, version: 1 },
          { ...MOCK_AMENDMENT, updatedAt: 1723653222, version: 2 },
        ],
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithAmendments);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: true, facilityEndDate: mockFacilityEndDate });
    });
  });

  describe('when there are no amendments', () => {
    it('should return the values from the facility snapshot when isUsingFacilityEndDate is true', () => {
      // Arrange
      const facilityWithFEDSnapshotValues: TfmFacility = {
        ...facility,
        facilitySnapshot: facilitySnapshotWithFacilityEndDate,
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithFEDSnapshotValues);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: true, facilityEndDate: mockFacilityEndDate });
    });

    it('should return the values from the facility snapshot when isUsingFacilityEndDate is false', () => {
      // Arrange
      const facilityWithFEDSnapshotValues: TfmFacility = {
        ...facility,
        facilitySnapshot: facilitySnapshotWithBankReviewDate,
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithFEDSnapshotValues);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: false, bankReviewDate: mockBankReviewDate });
    });
  });
});
