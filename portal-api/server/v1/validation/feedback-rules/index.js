const role = require('./role');
const organisation = require('./organisation');
const reasonForVisiting = require('./reason-for-visiting');
const satisfied = require('./satisfied');
const easyToUse = require('./easy-to-use');
const clearlyExplained = require('./clearly-explained');
const emailAddress = require('./email-address');

const rules = [role, organisation, reasonForVisiting, easyToUse, clearlyExplained, satisfied, emailAddress];

module.exports = (feedback) => {
  let errorList = {};

  for (let index = 0; index < rules.length; index += 1) {
    errorList = rules[index](feedback, errorList);
  }

  return errorList;
};
