const { isSuperUser } = require('../../users/checks');
const bondFixer = require('./bondFixer');
const loanFixer = require('./loanFixer');

const filtersWeDoManually = [
  'transaction.transactionStage',
  'transaction.transactionType',
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
