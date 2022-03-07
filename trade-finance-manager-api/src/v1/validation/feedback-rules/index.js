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

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](feedback, errorList);
  }

  return errorList;
};
