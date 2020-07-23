const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const BANKFACILITYID = 'transaction.bankFacilityId';
const filtersWeDoManually = [
  'transaction.transactionStage',
  'transaction.transactionType',
  BANKFACILITYID,
];

const constructor = (user, graphQLFilters) => {
  const bondFix = bondFixer(graphQLFilters);
  const loanFix = loanFixer(graphQLFilters);

  const transactionsQuery = () => {
    // copy the filters into our own object so we can mess with it
    let query = {};
    if (graphQLFilters && graphQLFilters !== {}) {
      query = { ...graphQLFilters };
    }

    // if the user is not a superuser,
    // -> we must only ever show them data related to their bank
    if (!isSuperUser(user)) {
      query['details.owningBank.id'] = { $eq: user.bank.id };
    }

    // if we're querying directly by bank facility id; re-do this as something that can work
    //  as part of the mongo query, otherwise we will loop over everything looking for one id..
    //   possibly learning enough about mongo to do this better now..
    if (query[BANKFACILITYID]) {
      const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { uniqueIdentificationNumber: query[BANKFACILITYID] } } };
      const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { bankReferenceNumber: query[BANKFACILITYID] } } };
      query.$or = [bondMatchesOnUniqueIdNum, loanMatchesOnBankRefNum];
    }


    // using Array.filter as a cheap and cheesy iterator
    //  we look at each of the filters we're supposed to be ignoring in mongo
    //  and if we find them we delete them from this query object
    filtersWeDoManually.filter((filterThatIsNotForMongo) => {
      if (query[filterThatIsNotForMongo]) {
        delete query[filterThatIsNotForMongo];
      }
      return false;// because lint requires me to return something because i'm using .filter..
    });

    return query;
  };

  const filteredTransactions = (deal) => {
    // if we're explicitly filtering out bonds:
    //  - default to an empty list of bonds, avoid having to think about edge cases
    // if we're not explicitly filtering bonds out
    //  - use our bondFix toolkit to get the list of bonds it's legit to display
    const bonds = bondFix.shouldReturnBonds() ? bondFix.filteredBondsFor(deal) : [];
    // same for loans
    const loans = loanFix.shouldReturnLoans() ? loanFix.filteredLoansFor(deal) : [];

    return bonds.concat(loans);
  };

  return {
    transactionsQuery,
    filteredTransactions,
  };
};


module.exports = constructor;
