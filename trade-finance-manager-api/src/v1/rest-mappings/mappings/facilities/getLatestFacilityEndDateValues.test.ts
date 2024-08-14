import { ObjectId } from 'mongodb';
import { getLatestFacilityEndDateValues } from './getLatestFacilityEndDateValues.ts';
import { MOCK_AMENDMENT, MOCK_FACILITY_SNAPSHOT } from '../../../__mocks__/mock-tfm-facilities';

describe('getLatestFacilityEndDateValues', () => {
  const facility = {
    _id: new ObjectId('1234567890abcdef12345678'),
    facilitySnapshot: MOCK_FACILITY_SNAPSHOT,
  };

  describe('when there are amendments', () => {
    it('should return the values from the facility snapshot when no amendments update the FED values', () => {
      // Arrange
      const facilityWithAmendments = {
        ...facility,
        facilitySnapshot: { ...MOCK_FACILITY_SNAPSHOT, isUsingFacilityEndDate: true, facilityEndDate: new Date('2024-03-05') },
        amendments: [
          { ...MOCK_AMENDMENT, updatedAt: 1723653111, version: 1 },
          { ...MOCK_AMENDMENT, updatedAt: 1723653222, version: 2 },
        ],
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithAmendments);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: true, facilityEndDate: new Date('2024-03-05'), bankReviewDate: undefined });
    });

    it('should return the the latest amendment value when the FED has been amended', () => {
      // Arrange
      const facilityWithAmendments = {
        ...facility,
        facilitySnapshot: { ...MOCK_FACILITY_SNAPSHOT, isUsingFacilityEndDate: true, facilityEndDate: new Date('2024-03-05') },
        amendments: [
          { ...MOCK_AMENDMENT, updatedAt: 1723653111, version: 1, tfm: { bankReviewDate: new Date('2025-05-05'), isUsingFacilityEndDate: false } },
          { ...MOCK_AMENDMENT, updatedAt: 1723653222, version: 2 },
        ],
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithAmendments);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: false, bankReviewDate: new Date('2025-05-05'), facilityEndDate: undefined });
    });
  });

  describe('when there are no amendments', () => {
    it('should return the values from the facility snapshot when isUsingFacilityEndDate is true', () => {
      // Arrange
      const facilityWithFEDSnapshotValues = {
        ...facility,
        facilitySnapshot: { ...MOCK_FACILITY_SNAPSHOT, isUsingFacilityEndDate: true, facilityEndDate: new Date('2024-03-05') },
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithFEDSnapshotValues);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: true, facilityEndDate: new Date('2024-03-05'), bankReviewDate: undefined });
    });

    it('should return the values from the facility snapshot when isUsingFacilityEndDate is false', () => {
      // Arrange
      const facilityWithFEDSnapshotValues = {
        ...facility,
        facilitySnapshot: { ...MOCK_FACILITY_SNAPSHOT, isUsingFacilityEndDate: false, bankReviewDate: new Date('2025-03-05') },
      };

      // Act
      const result = getLatestFacilityEndDateValues(facilityWithFEDSnapshotValues);

      // Assert
      expect(result).toEqual({ isUsingFacilityEndDate: false, bankReviewDate: new Date('2025-03-05'), facilityEndDate: undefined });
    });
  });
});
