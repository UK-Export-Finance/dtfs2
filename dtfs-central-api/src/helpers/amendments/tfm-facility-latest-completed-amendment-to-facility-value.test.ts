import { TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { getLatestCompletedAmendmentToFacilityValue } from './tfm-facility-latest-completed-amendment-to-facility-value';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

describe('tfm-facility-latest-completed-amendment-to-facility-value', () => {
  describe('getLatestCompletedAmendmentFacilityValue', () => {
    it('returns undefined when the supplied tfm facility amendments are undefined', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: undefined,
      };

      // Act
      const result = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined when the supplied tfm facility amendments array is empty', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: [],
      };

      // Act
      const result = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined when the supplied tfm facility has no completed amendments', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'In progress', value: 100000 },
        { ...aTfmFacilityAmendment(), status: 'Not started', value: 200000 },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined when the supplied tfm facility has completed amendments without a defined value', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'Completed', value: undefined },
        { ...aTfmFacilityAmendment(), status: 'Completed', value: undefined },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns the value of the latest completed amendment with a defined value', () => {
      // Arrange
      const latestCompletedAmendmentToFacilityValue = 5000;

      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'Completed', value: 1, updatedAt: new Date('2022').getTime() },
        { ...aTfmFacilityAmendment(), status: 'Not started', value: 2, updatedAt: new Date('2025').getTime() },
        {
          ...aTfmFacilityAmendment(),
          status: 'Completed',
          value: latestCompletedAmendmentToFacilityValue,
          updatedAt: new Date('2023').getTime(),
        },
        { ...aTfmFacilityAmendment(), status: 'In progress', value: 3, updatedAt: new Date('2024').getTime() },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentToFacilityValue(tfmFacility);

      // Assert
      expect(result).toEqual(latestCompletedAmendmentToFacilityValue);
    });
  });
});
