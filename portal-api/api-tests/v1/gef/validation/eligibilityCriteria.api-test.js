const {
  getAnsweredItems,
  isAutomaticCover,
  eligibilityCriteriaStatus,
} = require('../../../../src/v1/gef/controllers/validation/eligibilityCriteria');
const CONSTANTS = require('../../../../src/constants');

describe('GEF controllers validation - eligibilityCriteria', () => {
  describe('getAnsweredItems', () => {
    it('should return all items that have true or false answers', () => {
      const mockAnswers = [
        { answer: true },
        { answer: false },
        { answer: null },
      ];

      const result = getAnsweredItems(mockAnswers);

      const expected = mockAnswers.filter((a) => a.answer !== null);

      expect(result).toEqual(expected);
    });
  });

  describe('isAutomaticCover', () => {
    describe('when all every answer is true', () => {
      it('should return true', () => {
        const mockAnswers = [
          { answer: true },
          { answer: true },
        ];

        const result = isAutomaticCover(mockAnswers);
        expect(result).toEqual(true);
      });
    });

    describe('when a single answer is null', () => {
      it('should return false', () => {
        const mockAnswers = [
          { answer: true },
          { answer: null },
        ];

        const result = isAutomaticCover(mockAnswers);
        expect(result).toEqual(false);
      });
    });

    it('should return false', () => {
      const mockAnswers = [
        { answer: null },
        { answer: false },
      ];

      const result = isAutomaticCover(mockAnswers);
      expect(result).toEqual(false);
    });
  });

  describe('eligibilityCriteriaStatus', () => {
    describe('when no answers have been provided', () => {
      it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED}`, () => {
        const mockAnswers = [
          { answer: null },
          { answer: null },
        ];

        const result = eligibilityCriteriaStatus(mockAnswers);

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED);
      });
    });

    describe('when some answers have been provided', () => {
      it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS}`, () => {
        const mockAnswers = [
          { answer: null },
          { answer: true },
        ];

        const result = eligibilityCriteriaStatus(mockAnswers);

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS);
      });
    });

    describe('when ALL answers have been provided', () => {
      it(`should return ${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED}`, () => {
        const mockAnswers = [
          { answer: true },
          { answer: false },
        ];

        const result = eligibilityCriteriaStatus(mockAnswers);

        expect(result).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
      });
    });
  });
});
