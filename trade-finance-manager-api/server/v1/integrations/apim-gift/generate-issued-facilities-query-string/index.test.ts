import { ObjectId } from 'mongodb';
import { TfmFacility } from '@ukef/dtfs2-common';
import { mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3, mockTfmIssuedFacility4 } from '../test-mocks';
import { generateIssuedFacilitiesQueryString } from '.';

describe('generateIssuedFacilitiesQueryString', () => {
  describe('when multiple facilities are provided', () => {
    it('should return comma-separated string of facility IDs', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockTfmIssuedFacility3];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      const expected = 'FACILITY-001,FACILITY-002,FACILITY-003';

      expect(result).toEqual(expected);
    });

    it('should preserve order of facilities in query string', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility3, mockTfmIssuedFacility1, mockTfmIssuedFacility2];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      expect(result).toEqual('FACILITY-003,FACILITY-001,FACILITY-002');
    });

    it('should handle mixed facility ID formats', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1, mockTfmIssuedFacility4, mockTfmIssuedFacility2];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      const expected = 'FACILITY-001,0030012345,FACILITY-002';

      expect(result).toEqual(expected);
    });
  });

  describe('when a single facility is provided', () => {
    it('should return the facility ID without trailing comma', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility1];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      const expected = 'FACILITY-001';

      expect(result).toEqual(expected);
    });
  });

  describe('when no facilities are provided', () => {
    it('should return an empty string', () => {
      // Arrange
      const issuedFacilities: TfmFacility[] = [];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      expect(result).toEqual('');
    });
  });

  describe('when facilities have numeric facility IDs', () => {
    it('should convert facility IDs to string format', () => {
      // Arrange
      const issuedFacilities = [mockTfmIssuedFacility4];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      const expected = mockTfmIssuedFacility4.facilitySnapshot.ukefFacilityId;

      expect(result).toEqual(expected);
    });
  });

  describe('when facilities have special characters in IDs', () => {
    it('should preserve special characters in facility IDs', () => {
      // Arrange
      const mockUkefFacilityIdWithSpecialChars = 'FAC-001-TEST/2024';

      const mockFacility = {
        _id: new ObjectId('61f7a4edcf809301e78fbe57'),
        facilitySnapshot: {
          ukefFacilityId: mockUkefFacilityIdWithSpecialChars,
          hasBeenIssued: true,
        },
        tfm: {},
      } as unknown as TfmFacility;
      const issuedFacilities = [mockTfmIssuedFacility1, mockFacility];

      // Act
      const result = generateIssuedFacilitiesQueryString(issuedFacilities);

      // Assert
      const expected = `FACILITY-001,${mockUkefFacilityIdWithSpecialChars}`;

      expect(result).toEqual(expected);
    });
  });
});
