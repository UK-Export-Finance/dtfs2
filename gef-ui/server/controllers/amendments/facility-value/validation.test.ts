import { validateFacilityValue } from './validation';

const errRef = 'facilityValue';

describe('validateFacilityValue', () => {
  const errorTestCases = [
    {
      description: 'the value is an empty string',
      value: '',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains non-numeric characters',
      value: '1000x',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains too many decimal places',
      value: 'abc',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains too many decimal places',
      value: '!@£',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains too many decimal places',
      value: '1ooo',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains too many decimal places',
      value: '1000.000',
      expectedError: {
        errRef,
        errMsg: 'Enter a valid facility value',
      },
    },
    {
      description: 'the value contains too many decimal points',
      value: '1000.00.0',
      expectedError: {
        errRef,
        errMsg: 'Enter the new facility value in number format',
      },
    },
    {
      description: 'the value contains has no leading digit',
      value: '.99',
      expectedError: {
        errRef,
        errMsg: 'Enter a valid facility value',
      },
    },
    {
      description: 'the value ends with a decimal place',
      value: '123.',
      expectedError: {
        errRef,
        errMsg: 'Enter a valid facility value',
      },
    },
    {
      description: 'the value is too small',
      value: '0.99',
      expectedError: {
        errRef,
        errMsg: 'Enter a valid facility value',
      },
    },
    {
      description: 'the value is too large',
      value: '1000000000000.01',
      expectedError: {
        errRef,
        errMsg: 'The new facility value is too high',
      },
    },
  ];

  it.each(errorTestCases)('should return the correct error when $description', ({ value, expectedError }) => {
    // Act
    const result = validateFacilityValue(value);

    // Assert
    expect(result).toEqual({ errors: [expectedError] });
  });

  const successTestCases = [
    {
      description: 'the value is 1',
      value: '1',
    },
    {
      description: 'the value is 1 trillion',
      value: '1000000000000',
    },
    {
      description: 'the value has 1 decimal place',
      value: '10.2',
    },
    {
      description: 'the value has 2 decimal places',
      value: '10.23',
    },
  ];

  it.each(successTestCases)('should return the value as a number when $description', ({ value }) => {
    // Act
    const result = validateFacilityValue(value);

    // Assert
    expect(result).toEqual({ value: Number(value) });
  });
});
