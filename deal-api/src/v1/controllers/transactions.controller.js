const transactionFixer = require('./transactions/transactionFixer');

const db = require('../../drivers/db-client');

exports.findPaginatedTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  console.log(`>>> findPaginatedTransactions, filter=${JSON.stringify(filter)}`);

  // try to hide all the horrible logic for filtering in here:
  const transactionFix = transactionFixer(requestingUser, filter);

  // work out the mongo query to get all the deals that might contain transactions we care about
  const query = transactionFix.transactionsQuery();
  console.log(`query :: \n\n${JSON.stringify(query, null, 2)}\n\n`);
  // get the deals that might contain transactions we care about
  //   ordered by deal.details.dateOfLastAction
  const collection = await db.getCollection('deals');
  const dealResults = collection.find(query);
  const dealsWithTransactions = await dealResults.sort({ 'details.dateOfLastAction': -1 }).toArray();
  // console.log(`bonds :: ${JSON.stringify(dealsWithTransactions.map((deal) => deal.bondTransactions, null, 2))}`);
  // console.log(`loans :: ${JSON.stringify(dealsWithTransactions.map((deal) => deal.loanTransactions, null, 2))}`);

  // use Array.reduce to loop over our list of deals,
  //  accumulating an array of "loans and bonds" suitable to return via the API
  const allTransactions = dealsWithTransactions.reduce((transactionsAccumulatedSoFar, deal) => {
    // use our transactionFix toolkit to get the list of bonds+loans that fit the provided filters
    const transactionsForThisDeal = transactionFix.filteredTransactions(deal);
    return transactionsAccumulatedSoFar.concat(transactionsForThisDeal);
  }, []);

  // "allTransactions" now holds a list of all the transactions that it would be ok to display
  //  given current user+filtering

  // so now chop that list up based on the pagination instructions..
  // 1) chop off everything before the current page
  const transactionsWithoutPreviousPages = allTransactions.slice(start);
  // 2) chop us down to our max pagesize
  const page = transactionsWithoutPreviousPages.length > pagesize
    ? transactionsWithoutPreviousPages.slice(0, pagesize)
    : transactionsWithoutPreviousPages;

  // and finally... return the page of data
  return {
    count: allTransactions.length,
    transactions: page,
  };
};

// exports.findTransactions = async (user, dbFilters) =>
exports.findTransactions = async () =>
  // const collection = await db.getCollection('deals');
  //
  // const query = transactionsQuery(requestingUser, filter);
  //
  // const transactionResults = collection.find(query);
  //
  // const count = await transactionResults.count();
  // const transactions = await transactionResults
  //   .sort({ 'details.dateOfLastAction': -1 })
  //   .skip(start)
  //   .limit(pagesize)
  //   .toArray();
  //
  // return {
  //   count,
  //   transactions,
  // };
  ({ count: 0, transactions: [] });
