import { TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { getLatestCompletedAmendmentCoverEndDate } from './tfm-facilities.helper';
import { aTfmFacility, aTfmFacilityAmendment } from '../../test-helpers';

describe('tfm-facilities.helper', () => {
  describe('getLatestCompletedAmendmentCoverEndDate', () => {
    it('returns undefined when the supplied tfm facility amendments are undefined', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: undefined,
      };

      // Act
      const result = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

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
      const result = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined when the supplied tfm facility has no completed amendments', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'In progress', coverEndDate: new Date().getTime() },
        { ...aTfmFacilityAmendment(), status: 'Not started', coverEndDate: new Date().getTime() },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns undefined when the supplied tfm facility has completed amendments without a defined cover end date', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: undefined },
        { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: undefined },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

      // Assert
      expect(result).toBeUndefined();
    });

    it('returns the cover end date of the latest completed amendment with a defined cover end date', () => {
      // Arrange
      const latestCompletedAmendmentCoverEndDate = new Date('2024-01-01');
      const anotherCoverEndDate = new Date('2024-02-02');

      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: 'Completed', coverEndDate: anotherCoverEndDate.getTime(), updatedAt: new Date('2022').getTime() },
        { ...aTfmFacilityAmendment(), status: 'Not started', coverEndDate: anotherCoverEndDate.getTime(), updatedAt: new Date('2025').getTime() },
        {
          ...aTfmFacilityAmendment(),
          status: 'Completed',
          coverEndDate: latestCompletedAmendmentCoverEndDate.getTime(),
          updatedAt: new Date('2023').getTime(),
        },
        { ...aTfmFacilityAmendment(), status: 'In progress', coverEndDate: anotherCoverEndDate.getTime(), updatedAt: new Date('2024').getTime() },
      ];

      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      // Act
      const result = getLatestCompletedAmendmentCoverEndDate(tfmFacility);

      // Assert
      expect(result).toEqual(latestCompletedAmendmentCoverEndDate);
    });
  });
});
