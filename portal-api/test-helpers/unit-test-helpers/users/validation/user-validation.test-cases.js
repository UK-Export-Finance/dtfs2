const {
  getAllRulesFromAllRulesTestCases,
  mockRulesToNotReturnAnErrorSynchronously,
  mockRulesToNotReturnAnErrorAsynchronously,
} = require('./user-validation.test-helpers');

const itReturnsAnEmptyArray = (makeApplyRulesCall) => {
  it('returns an empty array', async () => {
    const result = await makeApplyRulesCall();
    expect(result).toEqual([]);
  });
};

const itReturnsTheErrorWhenTheSpecifiedRuleReturnsAnError = ({
  mockAllRulesToNotReturnAnError,
  mockASingleRuleToError,
  expectedRulesTestCases,
  makeApplyRulesCall,
}) => {
  it.each(expectedRulesTestCases)('returns the error when $description returns an error', async ({ description, rule }) => {
    mockAllRulesToNotReturnAnError();
    const expectedError = { error: `${description} error` };
    mockASingleRuleToError({ rule, error: expectedError });

    const result = await makeApplyRulesCall();

    expect(result).toEqual([expectedError]);
  });
};

const itThrowsAnError = ({ makeApplyRulesCall, expectedRulesTestCases, mockAllRulesToNotReturnAnError, mockASingleRuleToThrowAnUnhandledError }) => {
  it.each(expectedRulesTestCases)('throws an error when $description throws an error', async ({ rule }) => {
    mockAllRulesToNotReturnAnError();
    mockASingleRuleToThrowAnUnhandledError({ rule });

    await expect(() => makeApplyRulesCall()).rejects.toThrow();
  });
};

const itReturnsAllErrors = ({ makeApplyRulesCall, expectedErrors }) => {
  it('returns all errors', async () => {
    const result = await makeApplyRulesCall();

    // The following is used as order is not important and varies
    expect(result).toHaveLength(expectedErrors.length);
    expect(result).toEqual(expect.arrayContaining(expectedErrors));
  });
};

const whenApplyingRulesItAppliesOnlyTheExpectedRules = ({ makeApplyRulesCall, allRulesTestCases, expectedArgumentsToCallRuleWith }) => {
  const { expectedRulesTestCases, otherRulesTestCases } = allRulesTestCases;
  describe('when applying rules', () => {
    const allRules = getAllRulesFromAllRulesTestCases({ allRulesTestCases });

    beforeEach(() => {
      mockRulesToNotReturnAnErrorSynchronously({ rules: allRules });
    });

    if (expectedRulesTestCases.length !== 0) {
      it.each(expectedRulesTestCases)('applies the $description rule', async ({ rule }) => {
        await makeApplyRulesCall();

        expect(rule).toHaveBeenCalledTimes(1);
        expect(rule).toHaveBeenCalledWith(...expectedArgumentsToCallRuleWith);
      });
    }

    if (otherRulesTestCases.length !== 0) {
      it.each(otherRulesTestCases)('does not apply the $description rule', async ({ rule }) => {
        mockRulesToNotReturnAnErrorSynchronously({ rules: allRules });

        await makeApplyRulesCall();

        expect(rule).not.toHaveBeenCalled();
      });
    }
  });
};

const whenNoRulesReturnAnErrorItReturnsAnEmptyArray = ({ makeApplyRulesCall, allRulesTestCases }) => {
  const allRules = getAllRulesFromAllRulesTestCases({ allRulesTestCases });

  describe('when no rules return an error', () => {
    describe.each([
      {
        description: 'synchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorSynchronously({ rules: allRules }),
      },
      {
        description: 'asynchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorAsynchronously({ rules: allRules }),
      },
    ])('when the failing rule is $description', ({ mockAllRulesToNotReturnAnError }) => {
      beforeEach(() => {
        mockAllRulesToNotReturnAnError();
      });

      itReturnsAnEmptyArray(makeApplyRulesCall);
    });
  });
};

const whenASingleRuleReturnsAnErrorItReturnsTheError = ({ makeApplyRulesCall, allRulesTestCases }) => {
  const allRules = getAllRulesFromAllRulesTestCases({ allRulesTestCases });

  describe('when a single rule returns an error', () => {
    describe.each([
      {
        description: 'synchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorSynchronously({ rules: allRules }),
        mockASingleRuleToError: ({ rule, error }) => rule.mockReturnValue([error]),
      },
      {
        description: 'asynchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorAsynchronously({ rules: allRules }),
        mockASingleRuleToError: ({ rule, error }) => rule.mockResolvedValue([error]),
      },
    ])('when the failing rule is $description', ({ mockAllRulesToNotReturnAnError, mockASingleRuleToError }) => {
      itReturnsTheErrorWhenTheSpecifiedRuleReturnsAnError({
        mockAllRulesToNotReturnAnError,
        mockASingleRuleToError,
        expectedRulesTestCases: allRulesTestCases.expectedRulesTestCases,
        makeApplyRulesCall,
      });
    });
  });
};

const whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError = ({ makeApplyRulesCall, allRulesTestCases }) => {
  const allRules = getAllRulesFromAllRulesTestCases({ allRulesTestCases });

  describe('when a single rule throws an unhandled error', () => {
    describe.each([
      {
        description: 'synchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorSynchronously({ rules: allRules }),
        mockASingleRuleToThrowAnUnhandledError: ({ rule }) =>
          rule.mockImplementation(() => {
            throw new Error();
          }),
      },
      {
        description: 'asynchronous',
        mockAllRulesToNotReturnAnError: () => mockRulesToNotReturnAnErrorAsynchronously({ rules: allRules }),
        mockASingleRuleToThrowAnUnhandledError: ({ rule }) => rule.mockRejectedValue(new Error()),
      },
    ])('when the throwing rule is $description', ({ mockAllRulesToNotReturnAnError, mockASingleRuleToThrowAnUnhandledError }) => {
      itThrowsAnError({
        expectedRulesTestCases: allRulesTestCases.expectedRulesTestCases,
        makeApplyRulesCall,
        mockAllRulesToNotReturnAnError,
        mockASingleRuleToThrowAnUnhandledError,
      });
    });
  });
};

const whenMultipleRulesReturnErrorsItReturnsAllErrors = ({ makeApplyRulesCall, allRulesTestCases }) => {
  describe('when multiple rules return errors', () => {
    describe.each([
      {
        description: 'synchronous',
        mockASingleRuleToError: ({ rule, error }) => rule.mockReturnValue([error]),
      },
      {
        description: 'asynchronous',
        mockASingleRuleToError: ({ rule, error }) => rule.mockResolvedValue([error]),
      },
    ])('when all rules are $description', ({ mockASingleRuleToError }) => {
      const expectedErrors = [];
      beforeEach(() => {
        allRulesTestCases.expectedRulesTestCases.forEach(({ rule, description }) => {
          const error = { error: `${description} error` };
          mockASingleRuleToError({ rule, error });
          expectedErrors.push(error);
        });
      });

      itReturnsAllErrors({ makeApplyRulesCall, expectedErrors });
    });
  });
};

module.exports = {
  whenApplyingRulesItAppliesOnlyTheExpectedRules,
  whenNoRulesReturnAnErrorItReturnsAnEmptyArray,
  whenASingleRuleReturnsAnErrorItReturnsTheError,
  whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError,
  whenMultipleRulesReturnErrorsItReturnsAllErrors,
};
