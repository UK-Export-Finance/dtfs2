const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');
const passwordsCannotBeReUsed = require('./rules/passwordsCannotBeReUsed');
const passwordsMustMatch = require('./rules/passwordsMustMatch');
const currentPasswordMustMatch = require('./rules/currentPasswordMustMatch');

const createRules = [
  passwordAtLeast8Characters,
  passwordAtLeastOneNumber,
  passwordAtLeastOneUppercase,
  passwordAtLeastOneLowercase,
  passwordAtLeastOneSpecialCharacter,
];

const updateRules = [
  passwordAtLeast8Characters,
  passwordAtLeastOneNumber,
  passwordAtLeastOneUppercase,
  passwordAtLeastOneLowercase,
  passwordAtLeastOneSpecialCharacter,
  passwordsCannotBeReUsed,
  passwordsMustMatch,
  currentPasswordMustMatch,
];

const applyRules = (ruleset, existingUser, candidateChange) => ruleset.reduce((accumulator, rule) => {
  const result = rule(existingUser, candidateChange);
  return result.length ? accumulator.concat(result) : accumulator;
}, []);

const applyCreateRules = (candidateChange) => applyRules(createRules, null, candidateChange);

const applyUpdateRules = (existingUser, candidateChange) => applyRules(updateRules, existingUser, candidateChange);

module.exports = {
  applyCreateRules,
  applyUpdateRules,
};
