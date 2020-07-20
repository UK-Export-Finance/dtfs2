const assert = require('assert');
const { isSuperUser } = require('../users/checks');

const db = require('../../drivers/db-client');

const transactionsQuery = (user, filter) => {
  let query = {};
  if (filter && filter !== {}) {
    query = { ...filter };
  }

  if (!isSuperUser(user)) {
    query['details.owningBank.id'] = { $eq: user.bank.id };
  }

  return query;
};

const mapBondsToFacilities = (deal, bonds) => bonds.map((bond) => ({
  bankFacilityId: bond.uniqueIdentificationNumber,
  ukefFacilityId: '//TODO',
  transactionType: 'bond',
  facilityValue: bond.facilityValue,
  transactionStage: bond.bondStage,
  issuedDate: '//TODO',
  maker: deal.details.maker ? `${deal.details.maker.firstname} ${deal.details.maker.surname}` : '',
  checker: deal.details.checker ? `${deal.details.checker.firstname} ${deal.details.checker.surname}` : '',
}));

const mapLoansToFacilities = (deal, loans) => loans.map((loan) => ({
  bankFacilityId: loan.bankReferenceNumber,
  ukefFacilityId: '//TODO',
  transactionType: 'loan',
  facilityValue: loan.facilityValue,
  transactionStage: loan.facilityStage,
  issuedDate: '//TODO',
  maker: deal.details.maker ? `${deal.details.maker.firstname} ${deal.details.maker.surname}` : '',
  checker: deal.details.checker ? `${deal.details.checker.firstname} ${deal.details.checker.surname}` : '',
}));

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

exports.findPaginatedTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  const collection = await db.getCollection('deals');
  const query = transactionsQuery(requestingUser, filter);

  const dealResults = collection.find(query);
  const dealsWithTransactions = await dealResults.sort({ 'details.dateOfLastAction': -1 }).toArray();

  const reducer = (acc, deal) => {
    const bonds = deal.bondTransactions && deal.bondTransactions.items
      ? mapBondsToFacilities(deal, deal.bondTransactions.items)
      : [];
    const loans = deal.loanTransactions && deal.loanTransactions.items
      ? mapLoansToFacilities(deal, deal.loanTransactions.items)
      : [];
    return acc.concat(bonds).concat(loans);
  };

  const allTransactions = dealsWithTransactions.reduce(reducer, []);
  const transactionsWithoutPreviousPages = allTransactions.slice(start);
  const page = transactionsWithoutPreviousPages.length > pagesize
    ? transactionsWithoutPreviousPages.slice(0, pagesize)
    : transactionsWithoutPreviousPages;

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
