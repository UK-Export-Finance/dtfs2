const role = require('./role');
const team = require('./team');
const satisfied = require('./satisfied');
const easyToUse = require('./easy-to-use');
const emailAddress = require('./email-address');
const whyUsingService = require('./why-using-service');

const rules = [
  role,
  team,
  whyUsingService,
  easyToUse,
  satisfied,
  emailAddress,
];

module.exports = (feedback) => {
  let errorList = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const eachRule of rules) {
    errorList = eachRule(feedback, errorList);
  }

  return errorList;
};
