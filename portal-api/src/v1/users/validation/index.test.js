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
const { applyCreateRules, applyUpdateRules } = require('./index');

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

    whenApplyingRulesItAppliesOnlyTheExpectedRules({
      makeApplyRulesCall,
      expectedRules,
      expectedArgumentsToCallRuleWith: [null, createUserRequest],
    });
    whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall });

    whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRules });

    whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRules });
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
      whenApplyingRulesItAppliesOnlyTheExpectedRules({
        makeApplyRulesCall,
        expectedRules,
        expectedArgumentsToCallRuleWith,
      });

      whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall });

      whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRules });

      whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRules });
    });
  });

  function whenApplyingRulesItAppliesOnlyTheExpectedRules({ makeApplyRulesCall, expectedRules, expectedArgumentsToCallRuleWith }) {
    describe('when applying rules', () => {
      const { expectedRulesTestCases, otherRulesTestCases } = getExpectedRuleAndOtherRulesTestCases({
        expectedRules,
      });

      if (expectedRulesTestCases.length !== 0) {
        it.each(expectedRulesTestCases)('applies the $description rule', ({ rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();

          makeApplyRulesCall();

          expect(rule).toHaveBeenCalledTimes(1);
          expect(rule).toHaveBeenCalledWith(expectedArgumentsToCallRuleWith[0], expectedArgumentsToCallRuleWith[1]);
        });
      }

      if (otherRulesTestCases.length !== 0) {
        it.each(otherRulesTestCases)('does not apply the $description rule', ({ rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();

          makeApplyRulesCall();

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

  function whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, expectedRules }) {
    const { expectedRulesTestCases } = getExpectedRuleAndOtherRulesTestCases({
      expectedRules,
    });

    describe('when a single rule returns an error', () => {
      describe('when the failing rule is synchronous', () => {
        it.each(expectedRulesTestCases)('returns the error when $description returns an error', ({ description, rule }) => {
          mockAllRulesToNotReturnAnErrorSynchronously();
          const expectedError = { error: `${description} error` };
          rule.mockReturnValue([expectedError]);

          const result = makeApplyRulesCall();

          expect(result).toEqual([expectedError]);
        });
      });

      describe('when the failing rule is asynchronous', () => {
        it.each(expectedRulesTestCases)('returns the error when $description returns an error', ({ description, rule }) => {
          const expectedError = { error: `${description} error` };
          rule.mockResolvedValue([expectedError]);

          const result = makeApplyRulesCall();

          expect(result).toEqual([expectedError]);
        });
      });
    });
  }

  function itReturnsAnEmptyArray({ makeApplyRulesCall }) {
    it('returns an empty array', () => {
      const result = makeApplyRulesCall();
      expect(result).toEqual([]);
    });
  }

  function whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, expectedRules }) {
    describe('when multiple rules return errors', () => {
      const { expectedRulesTestCases } = getExpectedRuleAndOtherRulesTestCases({
        expectedRules,
      });

      it('returns all errors', () => {
        const expectedErrors = [];
        expectedRulesTestCases.forEach(({ rule, description }) => {
          const error = { error: `${description} error` };
          rule.mockReturnValue([error]);
          expectedErrors.push(error);
        });

        const result = makeApplyRulesCall();

        expect(result.sort()).toEqual(expectedErrors.sort());
        expect(result.length).toEqual(expectedErrors.length);
      });
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
