const issuedDate = require('../fields/issued-date');
const requestedCoverStartDate = require('../fields/requested-cover-start-date');
const coverEndDate = require('../fields/cover-end-date');
const disbursementAmount = require('../loan-rules/facility-stage-unconditional/disbursement-amount');
const bankReferenceNumber = require('../loan-rules/bank-reference-number');

// TODO move bankReferenceNumber to fields directory
// TODO move disbursementAmount to fields directory

// TODO figure out conditional/unconditional things
// ^ isn't in this case, disbursementAmount for a conditional loan?
// so why is it in unconditional rules directory?

const rules = [
  issuedDate,
  requestedCoverStartDate,
  coverEndDate,
  disbursementAmount,
  bankReferenceNumber,
];

module.exports = (loanIssueFacility) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](loanIssueFacility, errorList);
  }

  return errorList;
};
