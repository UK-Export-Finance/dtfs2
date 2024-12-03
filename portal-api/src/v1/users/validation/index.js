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
const firstNameMustNotBeEmpty = require('./rules/firstName-must-not-be-empty');
const surnameMustNotBeEmpty = require('./rules/surname-must-not-be-empty');
const selectAtLeastOneRole = require('./rules/select-at-least-one-role');
const selectAtLeastOneBank = require('./rules/select-at-least-one-bank');

const createRules = [
  passwordAtLeast8Characters,
  passwordAtLeastOneNumber,
  passwordAtLeastOneUppercase,
  passwordAtLeastOneLowercase,
  passwordAtLeastOneSpecialCharacter,
  readOnlyRoleCannotBeAssignedWithOtherRoles,
  usernameAndEmailMustMatch,
  emailMustBeValidEmailAddress,
  emailMustBeUnique,
  firstNameMustNotBeEmpty,
  surnameMustNotBeEmpty,
  selectAtLeastOneRole,
  selectAtLeastOneBank,
];

const updateWithoutCurrentPasswordRules = [
  passwordAtLeast8Characters,
  passwordAtLeastOneNumber,
  passwordAtLeastOneUppercase,
  passwordAtLeastOneLowercase,
  passwordAtLeastOneSpecialCharacter,
  passwordsMustMatch,
  passwordsCannotBeReUsed,
  readOnlyRoleCannotBeAssignedWithOtherRoles,
  usernameAndEmailMustMatch,
  emailMustBeValidEmailAddress,
  emailMustBeUnique,
];

const updateWithCurrentPasswordRules = [...updateWithoutCurrentPasswordRules, currentPasswordMustMatch];

const applyRules = async (ruleset, existingUser, candidateChange) => {
  let errors = [];
  for (const rule of ruleset) {
    const result = await rule(existingUser, candidateChange);

    if (result.length) {
      errors = errors.concat(result);
    } // We concat here as rules return an array
  }

  return errors;
};

const applyCreateRules = async (candidateChange) => await applyRules(createRules, null, candidateChange);

const applyUpdateRules = async (existingUser, candidateChange) => {
  const rules = !candidateChange.currentPassword ? updateWithoutCurrentPasswordRules : updateWithCurrentPasswordRules;
  return await applyRules(rules, existingUser, candidateChange);
};

module.exports = {
  applyCreateRules,
  applyUpdateRules,
};
