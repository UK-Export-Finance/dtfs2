import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';
import { aTfmFacilityAmendment } from '../../../test-helpers';
import { getCompletedAmendments } from './completed-amendments';

describe('completed-amendments', () => {
  describe('getCompletedAmendments', () => {
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

      // Act
      const result = getCompletedAmendments(amendments);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0]).toBe(aCompletedAmendment);
      expect(result[1]).toBe(anotherCompletedAmendment);
    });
  });
});
