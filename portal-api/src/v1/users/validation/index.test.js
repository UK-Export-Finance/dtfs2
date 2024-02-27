const { resetAllWhenMocks } = require('jest-when');
const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');
const passwordsCannotBeReUsed = require('./rules/passwordsCannotBeReUsed');
const passwordsMustMatch = require('./rules/passwordsMustMatch');
const currentPasswordMustMatch = require('./rules/currentPasswordMustMatch');
const readOnlyRoleCannotBeAssignedWithOtherRoles = require('./rules/read-only-role-cannot-be-assigned-with-other-roles');
const usernameAndEmailMustMatch = require('./rules/username-and-email-must-match');
const emailMustBeValidEmailAddress = require('./rules/email-must-be-valid-email-address');
const emailMustBeUnique = require('./rules/email-must-be-unique');
const { applyCreateRules, applyUpdateRules } = require('.');

jest.mock('./rules/passwordAtLeast8Characters');
jest.mock('./rules/passwordAtLeastOneNumber');
jest.mock('./rules/passwordAtLeastOneUppercase');
jest.mock('./rules/passwordAtLeastOneLowercase');
jest.mock('./rules/passwordAtLeastOneSpecialCharacter');
jest.mock('./rules/passwordsCannotBeReUsed');
jest.mock('./rules/passwordsMustMatch');
jest.mock('./rules/currentPasswordMustMatch');
jest.mock('./rules/read-only-role-cannot-be-assigned-with-other-roles');
jest.mock('./rules/username-and-email-must-match');
jest.mock('./rules/email-must-be-valid-email-address');
jest.mock('./rules/email-must-be-unique');

describe('user validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const allRules = {
    passwordAtLeast8Characters,
    passwordAtLeastOneNumber,
    passwordAtLeastOneUppercase,
    passwordAtLeastOneLowercase,
    passwordAtLeastOneSpecialCharacter,
    passwordsCannotBeReUsed,
    passwordsMustMatch,
    currentPasswordMustMatch,
    readOnlyRoleCannotBeAssignedWithOtherRoles,
    usernameAndEmailMustMatch,
    emailMustBeValidEmailAddress,
    emailMustBeUnique,
  };

  describe('applyCreateRules', () => {
    const createUserRequest = {};

    const makeApplyRulesCall = async () => await applyCreateRules(createUserRequest);

    const expectedRules = [
      'passwordAtLeast8Characters',
      'passwordAtLeastOneNumber',
      'passwordAtLeastOneUppercase',
      'passwordAtLeastOneLowercase',
      'passwordAtLeastOneSpecialCharacter',
      'readOnlyRoleCannotBeAssignedWithOtherRoles',
      'usernameAndEmailMustMatch',
      'emailMustBeValidEmailAddress',
      'emailMustBeUnique',
    ];

    const { expectedRulesTestCases, otherRulesTestCases } = getExpectedRuleAndOtherRulesTestCases({
      expectedRules,
    });

    whenApplyingRulesItAppliesOnlyTheExpectedRules({
      makeApplyRulesCall,
      expectedRulesTestCases,
      otherRulesTestCases,
      expectedArgumentsToCallRuleWith: [null, createUserRequest],
    });

    whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall });

    whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRulesTestCases });

    whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRulesTestCases });
  });

  describe('applyUpdateRules', () => {
    const baseExistingUser = {};
    const baseUpdateUserRequestWithoutCurrentPassword = {};
    const updateUserRequestWithPassword = { ...baseUpdateUserRequestWithoutCurrentPassword, currentPassword: 'currentPassword' };

    const baseRuleSetWhenCurrentPasswordIsNotProvided = [
      'passwordAtLeast8Characters',
      'passwordAtLeastOneNumber',
      'passwordAtLeastOneUppercase',
      'passwordAtLeastOneLowercase',
      'passwordAtLeastOneSpecialCharacter',
      'passwordsMustMatch',
      'passwordsCannotBeReUsed',
      'readOnlyRoleCannotBeAssignedWithOtherRoles',
      'usernameAndEmailMustMatch',
      'emailMustBeValidEmailAddress',
      'emailMustBeUnique',
    ];
    const ruleSetWithPassword = [...baseRuleSetWhenCurrentPasswordIsNotProvided, 'currentPasswordMustMatch'];

    const testCases = [
      {
        description: 'current password is not provided',
        makeApplyRulesCall: async () => await applyUpdateRules(baseExistingUser, baseUpdateUserRequestWithoutCurrentPassword),
        expectedRules: baseRuleSetWhenCurrentPasswordIsNotProvided,
        expectedArgumentsToCallRuleWith: [baseExistingUser, baseUpdateUserRequestWithoutCurrentPassword],
      },
      {
        description: 'current password is provided',
        makeApplyRulesCall: async () => await applyUpdateRules(baseExistingUser, updateUserRequestWithPassword),
        expectedRules: ruleSetWithPassword,
        expectedArgumentsToCallRuleWith: [baseExistingUser, updateUserRequestWithPassword],
      },
    ];

    describe.each(testCases)('when $description', ({ makeApplyRulesCall, expectedRules, expectedArgumentsToCallRuleWith }) => {
      const { expectedRulesTestCases, otherRulesTestCases } = getExpectedRuleAndOtherRulesTestCases({ expectedRules });
      whenApplyingRulesItAppliesOnlyTheExpectedRules({
        makeApplyRulesCall,
        expectedRulesTestCases,
        otherRulesTestCases,
        expectedArgumentsToCallRuleWith,
      });

      whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall });

      whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRulesTestCases });

      whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRulesTestCases });
    });
  });

  function whenApplyingRulesItAppliesOnlyTheExpectedRules({
    makeApplyRulesCall,
    expectedRulesTestCases,
    otherRulesTestCases,
    expectedArgumentsToCallRuleWith,
  }) {
    describe('when applying rules', () => {
      beforeEach(() => {
        mockAllRulesToNotReturnAnErrorSynchronously();
      });

      if (expectedRulesTestCases.length !== 0) {
        it.each(expectedRulesTestCases)('applies the $description rule', async ({ rule }) => {
          await makeApplyRulesCall();

          expect(rule).toHaveBeenCalledTimes(1);
          expect(rule).toHaveBeenCalledWith(expectedArgumentsToCallRuleWith[0], expectedArgumentsToCallRuleWith[1]);
        });
      }

      if (otherRulesTestCases.length !== 0) {
        it.each(otherRulesTestCases)('does not apply the $description rule', async ({ rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();

          await makeApplyRulesCall();

          expect(rule).not.toHaveBeenCalled();
        });
      }
    });
  }

  function whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall }) {
    describe('when no rules return an error', () => {
      describe('when all rules are synchronous', () => {
        beforeEach(() => {
          mockAllRulesToNotReturnAnErrorSynchronously();
        });

        itReturnsAnEmptyArray({ makeApplyRulesCall });
      });
      describe('when all rules are asynchronous', () => {
        beforeEach(() => {
          mockAllRulesToNotReturnAnErrorAsynchronously();
        });

        itReturnsAnEmptyArray({ makeApplyRulesCall });
      });
    });
  }

  function whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRulesTestCases }) {
    describe('when a single rule returns an error', () => {
      describe('when the failing rule is synchronous', () => {
        it.each(expectedRulesTestCases)('returns the error when $description returns an error', async ({ description, rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();
          const expectedError = { error: `${description} error` };
          rule.mockReturnValue([expectedError]);

          const result = await makeApplyRulesCall();

          expect(result).toEqual([expectedError]);
        });
      });

      describe('when the failing rule is asynchronous', () => {
        it.each(expectedRulesTestCases)('returns the error when $description returns an error', async ({ description, rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();
          const expectedError = { error: `${description} error` };
          rule.mockResolvedValue([expectedError]);

          const result = await makeApplyRulesCall();

          expect(result).toEqual([expectedError]);
        });
      });
    });
  }

  function whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRulesTestCases }) {
    describe('when multiple rules return errors', () => {
      describe('when all rules are synchronous', () => {
        it('returns all errors', async () => {
          const expectedErrors = [];
          expectedRulesTestCases.forEach(({ rule, description }) => {
            const error = { error: `${description} error` };
            rule.mockReturnValue([error]);
            expectedErrors.push(error);
          });

          const result = await makeApplyRulesCall();

          expect(result).toEqual(expectedErrors);
          expect(result.length).toEqual(expectedErrors.length);
        });
      });

      describe('when all rules are asynchronous', () => {
        it('returns all errors', async () => {
          const expectedErrors = [];
          expectedRulesTestCases.forEach(({ rule, description }) => {
            const error = { error: `${description} error` };
            rule.mockResolvedValue([error]);
            expectedErrors.push(error);
          });

          const result = await makeApplyRulesCall();

          expect(result).toEqual(expectedErrors);
          expect(result.length).toEqual(expectedErrors.length);
        });
      });
    });
  }

  function itReturnsAnEmptyArray({ makeApplyRulesCall }) {
    it('returns an empty array', async () => {
      const result = await makeApplyRulesCall();
      expect(result).toEqual([]);
    });
  }

  function mockAllRulesToNotReturnAnErrorSynchronously() {
    for (const key of Object.keys(allRules)) {
      allRules[key].mockReturnValue([]);
    }
  }

  function mockAllRulesToNotReturnAnErrorAsynchronously() {
    for (const key of Object.keys(allRules)) {
      allRules[key].mockResolvedValue([]);
    }
  }

  function getExpectedRuleAndOtherRulesTestCases({ expectedRules }) {
    const expectedRulesTestCases = [];
    const otherRulesTestCases = [];
    let allRulesNames = Object.keys(allRules);

    expectedRules.forEach((expectedRule) => {
      if (allRulesNames.includes(expectedRule)) {
        expectedRulesTestCases.push({ description: expectedRule, rule: allRules[expectedRule] });
        allRulesNames = allRulesNames.filter((ruleName) => ruleName !== expectedRule);
      }
    });

    const otherRuleNames = allRulesNames;

    otherRuleNames.forEach((ruleName) => {
      otherRulesTestCases.push({ description: ruleName, rule: allRules[ruleName] });
    });

    return { expectedRulesTestCases, otherRulesTestCases };
  }
});
