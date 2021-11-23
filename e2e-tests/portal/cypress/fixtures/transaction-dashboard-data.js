// note this test data is only really interested in fields that feature
// on the transaction dashboard / transaction report
// -- fields not related to those pages can be tinkered with or removed or whatever

const aDealWithOneBond = require('./templates/aDealWithOneBond.json');
const aDealWithOneLoan = require('./templates/aDealWithOneLoan.json');
const aDealWithOneLoanAndOneBond = require('./templates/aDealWithOneLoanAndOneBond.json');
const aDealWithTenLoans = require('./templates/aDealWithTenLoans.json');
const aDealWithTenBonds = require('./templates/aDealWithTenBonds.json');
const aDealWithTenLoansAndTenBonds = require('./templates/aDealWithTenLoansAndTenBonds.json');

module.exports = {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
  aDealWithTenLoans,
  aDealWithTenBonds,
  aDealWithTenLoansAndTenBonds,
  all: [
    aDealWithOneBond,
    aDealWithOneLoan,
    aDealWithOneLoanAndOneBond,
    aDealWithTenLoans,
    aDealWithTenBonds,
    aDealWithTenLoansAndTenBonds,
  ],
};
