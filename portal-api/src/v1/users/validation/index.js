/**
 * This module defines and applies various validation rules for user creation and updates.
 *
 * The rules are imported from separate modules and grouped into different sets for
 * creation and update operations. The rules are applied asynchronously and return
 * any validation errors encountered.
 *
 * @module validationRules
 */

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
const adminFromUkefOnly = require('./rules/admin-from-ukef-only');

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
  adminFromUkefOnly,
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
  adminFromUkefOnly,
];

const updateWithCurrentPasswordRules = [...updateWithoutCurrentPasswordRules, currentPasswordMustMatch];

/**
 * Applies a set of validation rules to a candidate change.
 *
 * @param {Array<Function>} ruleset - An array of validation rule functions to apply.
 * @param {Object|null} existingUser - The existing user data, or null if creating a new user.
 * @param {Object} candidateChange - The candidate change data to validate.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of validation error messages.
 */
const applyRules = async (ruleset, candidateChange, existingUser = null) => {
  let errors = [];

  for (const rule of ruleset) {
    const result = await rule(existingUser, candidateChange);

    if (result.length) {
      // We concat here as rules return an array
      errors = errors.concat(result);
    }
  }

  return errors;
};

/**
 * Applies the creation rules to the candidate change.
 *
 * @param {Object} candidateChange - The candidate change data to validate.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of validation error messages.
 */
const applyCreateRules = async (candidateChange) => await applyRules(createRules, candidateChange);

/**
 * Applies the update rules to the candidate change.
 *
 * Selects the appropriate set of rules based on whether the current password is provided.
 *
 * @param {Object} existingUser - The existing user data.
 * @param {Object} candidateChange - The candidate change data to validate.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of validation error messages.
 */
const applyUpdateRules = async (existingUser, candidateChange) => {
  const rules = candidateChange.currentPassword ? updateWithCurrentPasswordRules : updateWithoutCurrentPasswordRules;
  /**
   * Below is to satisfy any email address pertinent rules.
   * The property has been set to `updateEmail` instead of using
   * existing property `username` and `email` for current
   * rules processing.
   */
  const change = {
    ...candidateChange,
    updateEmail: existingUser.username,
  };

  return await applyRules(rules, change, existingUser);
};

module.exports = {
  applyCreateRules,
  applyUpdateRules,
};
