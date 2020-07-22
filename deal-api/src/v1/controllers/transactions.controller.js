const assert = require('assert');
const { isSuperUser } = require('../users/checks');
const bondFixer = require('./transactions/bondFixer');
const loanFixer = require('./transactions/loanFixer');

const db = require('../../drivers/db-client');

const filtersWeDoManually = [
  'transaction.transactionStage',
  'transaction.transactionType',
];


const transactionsQuery = (user, filter, listOfFiltersToIgnore) => {
  // copy the filters into our own object so we can mess with it
  let query = {};
  if (filter && filter !== {}) {
    query = { ...filter };
  }

  // if the user is not a superuser,
  // -> we must only ever show them data related to their bank
  if (!isSuperUser(user)) {
    query['details.owningBank.id'] = { $eq: user.bank.id };
  }

  // using Array.filter as a cheap and cheesy iterator
  //  we look at each of the filters we're supposed to be ignoring in mongo
  //  and if we find them we delete them from this query object
  listOfFiltersToIgnore.filter((filterThatIsNotForMongo) => {
    if (query[filterThatIsNotForMongo]) {
      delete query[filterThatIsNotForMongo];
    }
    return false;// because lint requires me to return something because i'm using .filter..
  });

  return query;
};

exports.findPaginatedTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  // try to hide all the horrible logic for filtering in here:
  const bondFix = bondFixer(filter);
  const loanFix = loanFixer(filter);

  // work out the mongo query to get all the deals that might contain transactions we care about
  const query = transactionsQuery(requestingUser, filter, filtersWeDoManually);

  // get the deals that might contain transactions we care about
  //   ordered by deal.details.dateOfLastAction
  const collection = await db.getCollection('deals');
  const dealResults = collection.find(query);
  const dealsWithTransactions = await dealResults.sort({ 'details.dateOfLastAction': -1 }).toArray();

  // use Array.reduce to loop over our list of deals,
  //  accumulating an array of "loans and bonds" suitable to return via the API
  const allTransactions = dealsWithTransactions.reduce((transactionsAccumulatedSoFar, deal) => {
    // if we're explicitly filtering out bonds:
    //  - default to an empty list of bonds, avoid having to think about edge cases
    // if we're not explicitly filtering bonds out
    //  - use our bondFix toolkit to get the list of bonds it's legit to display
    const bonds = bondFix.shouldReturnBonds() ? bondFix.filteredBondsFor(deal) : [];
    // same for loans
    const loans = loanFix.shouldReturnLoans() ? loanFix.filteredLoansFor(deal) : [];

    // return our new accumulator, which should be:
    //   all the bonds+loans we've picked up so far
    //    plus the bonds from this deal that passed filtering
    //    plus the loans from this deal that passed filtering
    const updatedAccumulator = transactionsAccumulatedSoFar.concat(bonds).concat(loans);
    return updatedAccumulator;
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

const findTransactions = async (callback) => {
  const collection = await db.getCollection('transactions');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneTransaction = async (bankFacilityId, callback) => {
  const collection = await db.getCollection('transactions');

  collection.findOne({ bankFacilityId }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const transaction = await collection.insertOne(req.body);

  res.status(200).send(transaction);
};

exports.findAll = (req, res) => (
  findTransactions((transactions) => res.status(200).send({
    count: transactions.length,
    transactions,
  }))
);

exports.findOne = (req, res) => (
  findOneTransaction(req.params.bankFacilityId, (transaction) => res.status(200).send(transaction))
);

exports.update = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const status = await collection.updateOne(
    { bankFacilityId: { $eq: req.params.bankFacilityId } },
    { $set: req.body },
    {},
  );
  res.status(200).send(status);
};

exports.delete = async (req, res) => {
  const collection = await db.getCollection('transactions');
  const status = await collection.deleteOne({ bankFacilityId: req.params.bankFacilityId });
  res.status(200).send(status);
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
