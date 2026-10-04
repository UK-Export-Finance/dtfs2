import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';

import { isValidSubmissionType } from '.';

const { AIN, MIN } = DEAL_SUBMISSION_TYPE;

describe('isValidSubmissionType', () => {
  describe(`when the submission type is ${AIN}`, () => {
    it('should return true', () => {
      // Act
      const result = isValidSubmissionType(AIN);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe(`when the submission type is ${MIN}`, () => {
    it('should return true', () => {
      // Act
      const result = isValidSubmissionType(MIN);

      // Assert
      expect(result).toEqual(true);
    });
  });

  describe('when the submission type is invalid', () => {
    it('should return false', () => {
      // Act
      const result = isValidSubmissionType('INVALID_SUBMISSION_TYPE');

      // Assert
      expect(result).toEqual(false);
    });
  });

  describe('when the submission type is null', () => {
    it('should return false', () => {
      // Act
      const result = isValidSubmissionType(null);

      // Assert
      expect(result).toEqual(false);
    });
  });
});
