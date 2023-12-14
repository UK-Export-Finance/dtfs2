import eligibilityCheckYourAnswersValidationErrors from '.';
import FIELDS from '../pageFields';

describe('eligibility `check your answers` validation errors', () => {
  describe('eligibilityCheckYourAnswersValidationErrors', () => {
    it('should add `href` to each required field error on the relevant page', () => {
      const mockErrorList = {
        [FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
        [FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[1]]: { order: '2', text: 'Field is required' },
        [FIELDS.SUPPORTING_DOCUMENTATION.CONDITIONALLY_REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockDealId = '123';

      const result = eligibilityCheckYourAnswersValidationErrors(mockValidationErrors, mockDealId);

      const expected = {
        errorList: {
          [FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[0]]: {
            order: '1',
            text: 'Field is required',
            href: `/contract/${mockDealId}/eligibility/criteria#criterion-group-${FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[0]}`,
          },
          [FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[1]]: {
            order: '2',
            text: 'Field is required',
            href: `/contract/${mockDealId}/eligibility/criteria#criterion-group-${FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS[1]}`,
          },
          [FIELDS.SUPPORTING_DOCUMENTATION.CONDITIONALLY_REQUIRED_FIELDS[0]]: {
            order: '3',
            text: 'Field is required',
            href: `/contract/${mockDealId}/eligibility/supporting-documentation#${FIELDS.SUPPORTING_DOCUMENTATION.CONDITIONALLY_REQUIRED_FIELDS[0]}`,
          },
        },
        count: mockErrorList.length,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no validationErrors.errorList passed', () => {
      it('should return validationErrors object', () => {
        const mockValidationErrors = {};
        const result = eligibilityCheckYourAnswersValidationErrors(mockValidationErrors);
        expect(result).toEqual(mockValidationErrors);
      });
    });
  });
});
