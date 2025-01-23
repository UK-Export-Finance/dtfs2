import { parseEligibilityResponse } from './eligibility.helper.ts';

const currentCriteriaBooleanResponses = [
  {
    id: 1,
    text: 'Criterion 1',
    answer: true,
  },
  {
    id: 2,
    text: 'Criterion 2',
    textList: ['bullet 1', 'bullet 2'],
    answer: false,
  },
  {
    id: 3,
    text: 'Criterion 3',
    answer: false,
  },
];

const currentCriteriaNullResponses = [
  {
    id: 1,
    text: 'Criterion 1',
    answer: null,
  },
  {
    id: 2,
    text: 'Criterion 2',
    textList: ['bullet 1', 'bullet 2'],
    answer: null,
  },
  {
    id: 3,
    text: 'Criterion 3',
    answer: null,
  },
];

describe('parseEligibilityResponse', () => {
  describe('when the response body contains responses for all criteria', () => {
    const responseBodyAllCriteria = {
      '1': 'false',
      '2': 'true',
      '3': 'false',
    };

    it('should return the eligibility criteria with the new responses replacing boolean values', () => {
      // Act
      const result = parseEligibilityResponse(responseBodyAllCriteria, currentCriteriaBooleanResponses);

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          text: 'Criterion 1',
          answer: false,
        },
        {
          id: 2,
          text: 'Criterion 2',
          textList: ['bullet 1', 'bullet 2'],
          answer: true,
        },
        {
          id: 3,
          text: 'Criterion 3',
          answer: false,
        },
      ]);
    });

    it('should return the eligibility criteria with the new responses replacing null values', () => {
      // Act
      const result = parseEligibilityResponse(responseBodyAllCriteria, currentCriteriaNullResponses);

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          text: 'Criterion 1',
          answer: false,
        },
        {
          id: 2,
          text: 'Criterion 2',
          textList: ['bullet 1', 'bullet 2'],
          answer: true,
        },
        {
          id: 3,
          text: 'Criterion 3',
          answer: false,
        },
      ]);
    });
  });

  describe('when the response body is missing responses for some criteria', () => {
    const responseBodyMissingCriteria = {
      '1': 'true',
      '3': 'false',
    };

    it('should return the eligibility criteria with the missing answers as null', () => {
      // Act
      const result = parseEligibilityResponse(responseBodyMissingCriteria, currentCriteriaBooleanResponses);

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          text: 'Criterion 1',
          answer: true,
        },
        {
          id: 2,
          text: 'Criterion 2',
          textList: ['bullet 1', 'bullet 2'],
          answer: null,
        },
        {
          id: 3,
          text: 'Criterion 3',
          answer: false,
        },
      ]);
    });
  });

  describe('when the response body is missing responses for all criteria', () => {
    const responseBodyNoCriteria = {};

    it('should return the eligibility criteria with all answers as null', () => {
      // Act
      const result = parseEligibilityResponse(responseBodyNoCriteria, currentCriteriaBooleanResponses);

      // Assert
      expect(result).toEqual([
        {
          id: 1,
          text: 'Criterion 1',
          answer: null,
        },
        {
          id: 2,
          text: 'Criterion 2',
          textList: ['bullet 1', 'bullet 2'],
          answer: null,
        },
        {
          id: 3,
          text: 'Criterion 3',
          answer: null,
        },
      ]);
    });
  });
});
