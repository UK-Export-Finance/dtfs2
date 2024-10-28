import { TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';
import { getEffectiveFacilityValueAmendment } from './get-effective-facility-value-amendment';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

jest.mock('./filter-and-sort-completed-effective-amendments');

describe('get-effective-facility-value-amendment', () => {
  describe('getEffectiveFacilityValueAmendment', () => {
    const effectiveAtDate = new Date();

    it('returns null when the supplied tfm facility amendments are undefined', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: undefined,
      };

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the supplied tfm facility amendments array is empty', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: [],
      };

      when(filterAndSortCompletedEffectiveAmendments).calledWith([], effectiveAtDate).mockReturnValue([]);

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the supplied tfm facility has no completed amendments', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue([]);

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when none of the effective completed amendments have a defined value', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      const filteredAmendments = [{ ...aTfmFacilityAmendment(), value: undefined }];
      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue(filteredAmendments);

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns the value of the first completed effective amendment with a defined value', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      const filteredAmendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), value: undefined },
        { ...aTfmFacilityAmendment(), value: 111 },
        { ...aTfmFacilityAmendment(), value: 222 },
      ];
      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue(filteredAmendments);

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toEqual(111);
    });

    it('returns the value of the first completed effective with a value when the value as zero', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      const filteredAmendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), value: undefined },
        { ...aTfmFacilityAmendment(), value: 0 },
        { ...aTfmFacilityAmendment(), value: 222 },
      ];
      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue(filteredAmendments);

      // Act
      const result = getEffectiveFacilityValueAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toEqual(0);
    });
  });
});
