import { validateEligibilityResponse } from './validation';

const validCriterion1 = { id: 1, text: 'Criterion 1', answer: true };
const invalidCriterion1 = { id: 1, text: 'Criterion 1', answer: null };

const validCriterion2 = { id: 2, text: 'Criterion 2', answer: false };
const invalidCriterion2 = { id: 2, text: 'Criterion 2', answer: null };

const validCriterion3 = { id: 3, text: 'Criterion 3', textList: ['bullet point 1', 'bullet point 2'], answer: true };
const invalidCriterion3 = { id: 3, text: 'Criterion 3', textList: ['bullet point 1', 'bullet point 2'], answer: null };

describe('validateEligibilityResponse', () => {
  const errorTestCases = [
    {
      description: 'one criterion is invalid',
      value: [validCriterion1, invalidCriterion2, validCriterion3],
      expectedErrors: [
        {
          errRef: '2',
          errMsg: 'Select if criterion 2',
        },
      ],
    },
    {
      description: 'two criteria are invalid',
      value: [validCriterion1, invalidCriterion2, invalidCriterion3],
      expectedErrors: [
        {
          errRef: '2',
          errMsg: 'Select if criterion 2',
        },
        {
          errRef: '3',
          errMsg: 'Select if criterion 3',
        },
      ],
    },
    {
      description: 'all criteria are invalid',
      value: [invalidCriterion1, invalidCriterion2, invalidCriterion3],
      expectedErrors: [
        {
          errRef: '1',
          errMsg: 'Select if criterion 1',
        },
        {
          errRef: '2',
          errMsg: 'Select if criterion 2',
        },
        {
          errRef: '3',
          errMsg: 'Select if criterion 3',
        },
      ],
    },
  ];

  it.each(errorTestCases)('should return the correct error when $description', ({ value, expectedErrors }) => {
    // Act
    const result = validateEligibilityResponse(value);

    // Assert
    expect(result).toEqual({ errors: expectedErrors });
  });

  const successTestCases = [
    {
      description: 'all criteria are valid',
      value: [validCriterion1, validCriterion2, validCriterion3],
    },
  ];

  it.each(successTestCases)('should return the value as the original passed in array when $description', ({ value }) => {
    // Act
    const result = validateEligibilityResponse(value);

    // Assert
    expect(result).toEqual({ value });
  });
});
