import CONSTANTS from '../../constants';

import { validateCommentField, validateSubmittedValues } from './validateSubmittedValues.helper';
import { generateValidationErrors } from '../../helpers/validation';

describe('POST underwriting - managers decision - validate submitted values', () => {
  describe('validateCommentField', () => {
    it('should return validationError when value is over 8000 characters', () => {
      const errors = {};
      const count = 0;
      const fieldLabel = 'the field label';
      const fieldId = 'fieldId';

      const result = validateCommentField(errors, count, fieldLabel, fieldId, 'a'.repeat(8001));

      const expected = {
        errorsCount: 1,
        validationErrors: generateValidationErrors(fieldId, `${fieldLabel} must be 8000 characters or fewer`, count + 1, errors),
      };

      expect(result).toEqual(expected);
    });

    it('should not return validationError for text with symbols', () => {
      const errors = {};
      const count = 0;
      const fieldLabel = 'the field label';
      const fieldId = 'fieldId';

      const result = validateCommentField(errors, count, fieldLabel, fieldId, 'A sample comment, featuring various "punctuation!" £$%^@~#;[]{}');

      const expected = {
        errorsCount: 0,
        validationErrors: {},
      };

      expect(result).toEqual(expected);
    });

    describe('with no validationErrors', () => {
      it('should return the passed validationErrors and errorsCount', () => {
        const errors = {
          testing: true,
        };
        const count = 1;
        const fieldLabel = 'the field label';
        const fieldId = 'fieldId';

        const result = validateCommentField(errors, count, fieldLabel, fieldId, 'valid');

        const expected = {
          errorsCount: 1,
          validationErrors: errors,
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('validateSubmittedValues', () => {
    it('should return validationErrors when there is no `decision` value', () => {
      const result = validateSubmittedValues({
        decision: '',
      });

      const expected = generateValidationErrors('decision', 'Select if you approve or decline', 1);

      expect(result).toEqual(expected);
    });

    describe('when `decision` is `Approve with conditions`', () => {
      it('should return validationErrors when there is no `approveWithConditionsComments`', () => {
        const result = validateSubmittedValues({
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
          approveWithConditionsComments: '',
        });

        const expected = generateValidationErrors('approveWithConditionsComments', 'Enter conditions', 1);

        expect(result).toEqual(expected);
      });
    });

    describe('when `decision` is `Decline`', () => {
      it('should return validationErrors when there is no `declineComments`', () => {
        const result = validateSubmittedValues({
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED,
          declineComments: '',
        });

        const expected = generateValidationErrors('declineComments', 'Enter reasons', 1);

        expect(result).toEqual(expected);
      });
    });

    it('should return multiple validation errors', () => {
      const result = validateSubmittedValues({
        decision: '',
        internalComments: 'a'.repeat(8001),
      });

      expect(result.count).toEqual(2);

      const decisionError = generateValidationErrors('decision', 'Select if you approve or decline', 1).errorList.decision;

      expect(result.errorList.decision).toEqual(decisionError);

      const internalCommentsError = generateValidationErrors('internalComments', 'Comments must be 8000 characters or fewer', 2).errorList.internalComments;

      expect(result.errorList.internalComments).toEqual(internalCommentsError);
    });

    it('should return false when there are no validationErrors', () => {
      const result = validateSubmittedValues({
        decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS,
      });

      expect(result).toEqual(false);
    });
  });
});
