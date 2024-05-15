import { submittedEligibilityMatchesOriginalData, flattenOriginalData, originalCriteriaAnswersAsStrings } from './submittedEligibilityMatchesOriginalData';

describe('submittedEligibilityMatchesOriginalData', () => {
  describe('flattenOriginalData', () => {
    it('should return an object with removed `criteria`, `status` and `validationErrors`', () => {
      const originalData = {
        'criterion-1': 'true',
        'criterion-2': 'false',
        criteria: [{ answer: true }, { answer: false }],
        status: 'Incomplete',
        validationErrors: {},
      };

      const answersAsStrings = {
        'criterion-1': 'true',
        'criterion-2': 'false',
      };

      const result = flattenOriginalData(originalData, answersAsStrings);
      expect(result).toEqual({
        'criterion-1': 'true',
        'criterion-2': 'false',
      });
    });
  });

  describe('originalCriteriaAnswersAsStrings', () => {
    it('should return single object of criteria answers (that have values), from the given array of objects', () => {
      const originalData = [
        { id: '1', answer: true },
        { id: '2', answer: false },
        { id: '3', answer: true },
        { id: '4', answer: false },
        { id: '5', answer: '' },
      ];

      const result = originalCriteriaAnswersAsStrings(originalData);
      expect(result).toEqual({
        'criterion-1': String(originalData[0].answer),
        'criterion-2': String(originalData[1].answer),
        'criterion-3': String(originalData[2].answer),
        'criterion-4': String(originalData[3].answer),
      });
    });
  });

  describe('submittedEligibilityMatchesOriginalData', () => {
    describe('when a field is different from originalData object', () => {
      it('should return false', () => {
        const formData = {
          'criterion-1': 'true',
          'criterion-2': 'false',
        };
        const originalData = {
          criteria: [
            { id: 1, answer: false },
            { id: 2, answer: false },
          ],
        };

        const result = submittedEligibilityMatchesOriginalData(formData, originalData);
        expect(result).toEqual(false);
      });
    });

    describe('when a field is NOT different from originalData object', () => {
      it('should return true', () => {
        const formData = {
          'criterion-1': 'true',
          'criterion-2': 'false',
        };
        const originalData = {
          criteria: [
            { id: 1, answer: true },
            { id: 2, answer: false },
          ],
        };

        const result = submittedEligibilityMatchesOriginalData(formData, originalData);
        expect(result).toEqual(true);
      });
    });
  });
});
