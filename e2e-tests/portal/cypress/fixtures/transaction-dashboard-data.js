//note this test data is only really interested in fields that feature
//on the transaction dashboard / transaction report
//-- fields not related to those pages can be tinkered with or removed or whatever

const aDealWithOneBond = require('./templates/aDealWithOneBond');
const aDealWithOneLoan = require('./templates/aDealWithOneLoan');
const aDealWithOneLoanAndOneBond = require('./templates/aDealWithOneLoanAndOneBond');
const aDealWithTenLoans = require('./templates/aDealWithTenLoans');
const aDealWithTenBonds = require('./templates/aDealWithTenBonds');
const aDealWithTenLoansAndTenBonds = require('./templates/aDealWithTenLoansAndTenBonds');

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
}
