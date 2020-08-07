const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');

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
];

const applyRules = (ruleset, candidateUser) => ruleset.reduce((accumulator, rule) => {
  const result = rule(candidateUser);
  return result.length ? accumulator.concat(result) : accumulator;
}, []);

const applyCreateRules = (candidateUser) => applyRules(createRules, candidateUser);

const applyUpdateRules = (candidateUser) => applyRules(updateRules, candidateUser);

module.exports = {
  applyCreateRules,
  applyUpdateRules,
};
