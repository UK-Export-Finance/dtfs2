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

const createRules = [
  passwordAtLeast8Characters,
  passwordAtLeastOneNumber,
  passwordAtLeastOneUppercase,
  passwordAtLeastOneLowercase,
  passwordAtLeastOneSpecialCharacter,
  readOnlyRoleCannotBeAssignedWithOtherRoles,
  usernameAndEmailMustMatch,
  emailMustBeValidEmailAddress,
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
];

const updateWithCurrentPasswordRules = [...updateWithoutCurrentPasswordRules, currentPasswordMustMatch];

const applyRules = (ruleset, existingUser, candidateChange) =>
  ruleset.reduce((accumulator, rule) => {
    const result = rule(existingUser, candidateChange);
    return result.length ? accumulator.concat(result) : accumulator;
  }, []);

const applyCreateRules = (candidateChange) => applyRules(createRules, null, candidateChange);

const applyUpdateRules = (existingUser, candidateChange) => {
  const rule = !candidateChange.currentPassword ? updateWithoutCurrentPasswordRules : updateWithCurrentPasswordRules;
  return applyRules(rule, existingUser, candidateChange);
};

module.exports = {
  applyCreateRules,
  applyUpdateRules,
};
