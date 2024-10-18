import { TfmFacility, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { getEffectiveCoverEndDateAmendment } from './get-effective-cover-end-date-amendment';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';
import { filterAndSortCompletedEffectiveAmendments } from './filter-and-sort-completed-effective-amendments';

jest.mock('./filter-and-sort-completed-effective-amendments');

describe('get-effective-cover-end-date-amendment', () => {
  describe('getEffectiveCoverEndDateAmendment', () => {
    const effectiveAtDate = new Date();

    it('returns null when the supplied tfm facility amendments are undefined', () => {
      // Arrange
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments: undefined,
      };

      // Act
      const result = getEffectiveCoverEndDateAmendment(tfmFacility, effectiveAtDate);

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
      const result = getEffectiveCoverEndDateAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when the supplied tfm facility amendments contain no completed effective amendments', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue([]);

      // Act
      const result = getEffectiveCoverEndDateAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns null when none of the effective completed amendments have a defined cover end date', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      const filteredAmendments = [{ ...aTfmFacilityAmendment(), coverEndDate: undefined }];
      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue(filteredAmendments);

      // Act
      const result = getEffectiveCoverEndDateAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toBeNull();
    });

    it('returns the cover end date of the first completed effective amendment with a defined cover end date', () => {
      // Arrange
      const amendments: TfmFacilityAmendment[] = [aTfmFacilityAmendment()];
      const tfmFacility: TfmFacility = {
        ...aTfmFacility(),
        amendments,
      };

      const filteredAmendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), coverEndDate: undefined },
        { ...aTfmFacilityAmendment(), coverEndDate: new Date('2025-03-05').getTime() },
        { ...aTfmFacilityAmendment(), coverEndDate: new Date('2026-07-01').getTime() },
      ];
      when(filterAndSortCompletedEffectiveAmendments).calledWith(amendments, effectiveAtDate).mockReturnValue(filteredAmendments);

      // Act
      const result = getEffectiveCoverEndDateAmendment(tfmFacility, effectiveAtDate);

      // Assert
      expect(result).toEqual(new Date('2025-03-05'));
    });
  });
});
