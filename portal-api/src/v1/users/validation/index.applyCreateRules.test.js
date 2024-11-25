const { resetAllWhenMocks } = require('jest-when');
const { applyCreateRules } = require('.');
const { TEST_USER } = require('../../../../test-helpers/unit-test-mocks/mock-user');
const {
  whenApplyingRulesItAppliesOnlyTheExpectedRules,
  whenNoRulesReturnAnErrorItReturnsAnEmptyArray,
  whenASingleRuleReturnsAnErrorItReturnsTheError,
  whenMultipleRulesReturnErrorsItReturnsAllErrors,
  whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError,
} = require('../../../../test-helpers/unit-test-helpers/users/validation/user-validation.test-cases');

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
const { createTestCasesFromRules } = require('../../../../test-helpers/unit-test-helpers/users/validation/user-validation.test-helpers');

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

  describe('applyCreateRules', () => {
    const mockCreateTfmUserRequest = TEST_USER;

    const makeApplyRulesCall = async () => await applyCreateRules(mockCreateTfmUserRequest);
    const allRules = {
      expectedRules: {
        passwordAtLeast8Characters,
        passwordAtLeastOneNumber,
        passwordAtLeastOneUppercase,
        passwordAtLeastOneLowercase,
        passwordAtLeastOneSpecialCharacter,
        readOnlyRoleCannotBeAssignedWithOtherRoles,
        usernameAndEmailMustMatch,
        emailMustBeValidEmailAddress,
        emailMustBeUnique,
      },
      otherRules: {
        passwordsCannotBeReUsed,
        passwordsMustMatch,
        currentPasswordMustMatch,
      },
    };

    const allRulesTestCases = createTestCasesFromRules({ allRules });

    whenApplyingRulesItAppliesOnlyTheExpectedRules({
      makeApplyRulesCall,
      allRulesTestCases,
      expectedArgumentsToCallRuleWith: [null, mockCreateTfmUserRequest],
    });

    whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall, allRulesTestCases });

    whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, allRulesTestCases });

    whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError({ makeApplyRulesCall, allRulesTestCases });

    whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, allRulesTestCases });
  });
});
