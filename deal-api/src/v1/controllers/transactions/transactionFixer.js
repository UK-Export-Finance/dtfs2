const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const BANKFACILITYID = 'transaction.bankFacilityId';
const UKEFFACILITYID = 'transaction.ukefFacilityId'
const filtersWeDoManually = [
  'transaction.transactionStage',
  'transaction.transactionType',
  BANKFACILITYID,
  UKEFFACILITYID,
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

    // if we're querying directly by an id; re-do the query into something that works in our actual schema
    //   possibly learning enough about mongo to do this better now..
    let mongoFiltering = {};

    if (query[BANKFACILITYID]) {
      const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { uniqueIdentificationNumber: query[BANKFACILITYID] } } };
      const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { bankReferenceNumber: query[BANKFACILITYID] } } };

      mongoFiltering[BANKFACILITYID]= {$or: [bondMatchesOnUniqueIdNum, loanMatchesOnBankRefNum]};
    }

    if (query[UKEFFACILITYID]) {
      const bondMatchesOnUniqueIdNum = { 'bondTransactions.items': { $elemMatch: { ukefFacilityID: query[UKEFFACILITYID] } } };
      const loanMatchesOnBankRefNum = { 'loanTransactions.items': { $elemMatch: { ukefFacilityID: query[UKEFFACILITYID] } } };

      mongoFiltering[UKEFFACILITYID]= {$or: [bondMatchesOnUniqueIdNum, loanMatchesOnBankRefNum]};
    }

    if (mongoFiltering[UKEFFACILITYID] && mongoFiltering[BANKFACILITYID]) {
      query.$and = [mongoFiltering[UKEFFACILITYID], mongoFiltering[BANKFACILITYID]];
    } else if (mongoFiltering[UKEFFACILITYID]) {
      query.$or = mongoFiltering[UKEFFACILITYID].$or;
    } else if (mongoFiltering[BANKFACILITYID]) {
      query.$or = mongoFiltering[BANKFACILITYID].$or;
    }
    // -- end of tinkering with the mongoDB query directly.

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
