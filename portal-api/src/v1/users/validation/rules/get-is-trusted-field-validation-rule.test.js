const getIsTrustedFieldValidationRule = require('./get-is-trusted-field-validation-rule');

describe('getIsTrustedFieldValidationRule', () => {
  const userInputTestCases = [
    { description: 'when an existing user is present', user: { username: 'aValidUsername' } },
    {
      description: 'when an existing user is present with isTrusted field',
      user: { username: 'aValidUsername', istrusted: true },
    },
    { description: 'when no existing user is present', user: null },
  ];

  describe.each(userInputTestCases)('$description', ({ user }) => {
    describe('when required is true', () => {
      const validationFunction = (update) => getIsTrustedFieldValidationRule({ required: true })(user, update);

      whenTheChangeValueIsABoolean({
        validationFunction,
        expectedResult: itReturnsNoErrors,
      });

      whenTheChangeValueIsNotABoolean({
        validationFunction,
        expectedResult: itReturnsIsTrustedNotValidFormatError,
      });

      whenTheChangeValueIsNotProvided({
        validationFunction,
        expectedResult: itReturnsIsTrustedNotPresentError,
      });
    });

    describe('when required is false', () => {
      const validationFunction = (update) => getIsTrustedFieldValidationRule({ required: false })(user, update);

      whenTheChangeValueIsABoolean({
        validationFunction,
        expectedResult: itReturnsNoErrors,
      });

      whenTheChangeValueIsNotABoolean({
        validationFunction,
        expectedResult: itReturnsIsTrustedNotValidFormatError,
      });

      whenTheChangeValueIsNotProvided({
        validationFunction,
        expectedResult: itReturnsNoErrors,
      });
    });
  });

  function whenTheChangeValueIsABoolean({ validationFunction, expectedResult }) {
    const validBooleanTestCases = [
      { change: { isTrusted: true }, description: 'true' },
      { change: { isTrusted: false }, description: 'false' },
    ];
    describe('when the change value is a boolean', () => {
      describe.each(validBooleanTestCases)('when the change value is $description', ({ change }) => {
        expectedResult({ validationFunction, change });
      });
    });
  }

  function whenTheChangeValueIsNotABoolean({ validationFunction, expectedResult }) {
    const invalidBooleanTestCases = [
      { change: { isTrusted: 'true' }, description: 'string of "true"' },
      { change: { isTrusted: 'false' }, description: 'string of "false"' },
      { change: { isTrusted: '' }, description: 'empty string' },
      { change: { isTrusted: null }, description: 'null' },
      { change: { isTrusted: {} }, description: 'empty object' },
      { change: { isTrusted: [] }, description: 'empty array' },
      { change: { isTrusted: 0 }, description: 'falsey number (0)' },
      { change: { isTrusted: 1 }, description: 'truthy number (1)' },
    ];

    describe('when the change value is not a boolean', () => {
      describe.each(invalidBooleanTestCases)('when the change value is $description', ({ change }) => {
        expectedResult({ validationFunction, change });
      });
    });
  }

  function whenTheChangeValueIsNotProvided({ validationFunction, expectedResult }) {
    describe('when the change value is not provided', () => {
      const change = {};
      expectedResult({ validationFunction, change });
    });
  }

  function itReturnsIsTrustedNotPresentError({ validationFunction, change }) {
    it('should return the is trusted not present error', () => {
      const result = validationFunction(change);

      expect(result).toContainEqual({
        isTrusted: {
          order: '1',
          text: 'Select whether the user is trusted or not.',
        },
      });
    });
  }

  function itReturnsIsTrustedNotValidFormatError({ validationFunction, change }) {
    it('should return the is trusted not valid format error', () => {
      const result = validationFunction(change);
      expect(result).toContainEqual({
        isTrusted: {
          order: '2',
          text: 'Invalid value provided for the user isTrusted field (must be boolean).',
        },
      });
    });
  }

  function itReturnsNoErrors({ validationFunction, change }) {
    it('should return an empty array', () => {
      const result = validationFunction(change);
      expect(result).toStrictEqual([]);
    });
  }
});
