import validateSubmittedValues from './validateSubmittedValues';
import { generateValidationErrors } from '../../../../../helpers/validation';

describe('POST underwriting - pricing and risk - facility risk profile - validate submitted values', () => {
  describe('when `riskProfile` is not provided', () => {
    it('should return validationErrors', () => {
      const result = validateSubmittedValues({
        riskProfile: '',
      });

      const expected = generateValidationErrors('riskProfile', 'Select a risk profile', 1, {});

      expect(result).toEqual(expected);
    });
  });
});
