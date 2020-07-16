const role = require('./role');
const organisation = require('./organisation');
const reasonForVisiting = require('./reason-for-visiting');
const satisfied = require('./satisfied');
const easeOfUse = require('./ease-of-use');
const clearlyExplained = require('./clearly-explained');
const easyToUnderstand = require('./easy-to-understand');
const emailAddress = require('./email-address');

const rules = [
  role,
  organisation,
  reasonForVisiting,
  easeOfUse,
  clearlyExplained,
  easyToUnderstand,
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
