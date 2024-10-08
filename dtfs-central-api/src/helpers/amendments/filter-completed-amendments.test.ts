import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { aTfmFacilityAmendment } from '../../../test-helpers';
import { filterCompletedAmendments } from './filter-completed-amendments';

describe('filter-completed-amendments', () => {
  describe('filterCompletedAmendments', () => {
    it('should return all completed amendments', () => {
      // Arrange
      const aCompletedAmendment = { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.COMPLETED };
      const anotherCompletedAmendment = { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.COMPLETED };
      const amendments: TfmFacilityAmendment[] = [
        { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.IN_PROGRESS },
        aCompletedAmendment,
        { ...aTfmFacilityAmendment(), status: AMENDMENT_STATUS.NOT_STARTED },
        anotherCompletedAmendment,
      ];
      const expected = [aCompletedAmendment, anotherCompletedAmendment];

      // Act
      const result = filterCompletedAmendments(amendments);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
