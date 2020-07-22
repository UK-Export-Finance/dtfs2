const assert = require('assert');
const transactionFixer = require('./transactions/transactionFixer');

const db = require('../../drivers/db-client');

exports.findPaginatedTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  // try to hide all the horrible logic for filtering in here:
  const transactionFix = transactionFixer(requestingUser, filter);

  // work out the mongo query to get all the deals that might contain transactions we care about
  const query = transactionFix.transactionsQuery();

  // get the deals that might contain transactions we care about
  //   ordered by deal.details.dateOfLastAction
  const collection = await db.getCollection('deals');
  const dealResults = collection.find(query);
  const dealsWithTransactions = await dealResults.sort({ 'details.dateOfLastAction': -1 }).toArray();

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
