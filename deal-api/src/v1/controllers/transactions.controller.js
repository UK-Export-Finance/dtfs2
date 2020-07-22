const assert = require('assert');
const { isSuperUser } = require('../users/checks');

const db = require('../../drivers/db-client');

const filtersWeDoManually = ["transaction.transactionStage"];

const loanFilterMappings = {
  "transaction.transactionStage": {
    "transactionStage": {
      "unissued_conditional": "Conditional",
      "issued_unconditional": "Unconditional",
    }
  }
};

const bondFilterMappings = {
  "transaction.transactionStage": {
    "transactionStage": {
      "unissued_conditional": "Unissued",
      "issued_unconditional": "Issued",
    }
  }
}

const listOfGraphQlFiltersToTreatSpeciallyForBonds = () => Object.keys(bondFilterMappings);

const bondMapField = (fieldToMap) => {
  console.log(`bondMapField (${fieldToMap})`)
  if (!bondFilterMappings[fieldToMap]) {
    console.log(`bondMapField not found in ${JSON.stringify(bondFilterMappings)}`)
    return;
  }

  const mapsTo = Object.keys(bondFilterMappings[fieldToMap])[0];
  console.log(`bondMapField mapsTo ${mapsTo}`)
  return mapsTo;
}

const bondMapFilterValue = (graphQlField, bondField, valueInFilter) => {
  const mapping = bondFilterMappings[graphQlField][bondField];
  console.log(`mapping :: ${JSON.stringify(mapping)}`);
  return mapping[valueInFilter];
}

const bondFilters = Object.keys(bondFilterMappings);

const listOfGraphQlFiltersToTreatSpeciallyForLoans = () => Object.keys(loanFilterMappings);

const loanMapField = (fieldToMap) => {
  console.log(`loanMapField (${fieldToMap})`)
  if (!loanFilterMappings[fieldToMap]) {
    console.log(`loanMapField not found in ${JSON.stringify(loanFilterMappings)}`)
    return;
  }

  const mapsTo = Object.keys(loanFilterMappings[fieldToMap])[0];
  console.log(`loanMapField mapsTo ${mapsTo}`)
  return mapsTo;
}

const loanMapFilterValue = (graphQlField, loanField, valueInFilter) => {
  const mapping = loanFilterMappings[graphQlField][loanField];
  console.log(`mapping :: ${JSON.stringify(mapping)}`);
  return mapping[valueInFilter];
}

const loanFilters = Object.keys(loanFilterMappings);


const transactionsQuery = (user, filter) => {
  let query = {};
  if (filter && filter !== {}) {
    query = { ...filter };
  }

  if (!isSuperUser(user)) {
    query['details.owningBank.id'] = { $eq: user.bank.id };
  }

  filtersWeDoManually.filter( (manualFilter) => {
    if (query[manualFilter]) {
      delete query[manualFilter];
    }
  });

  return query;
};

const mapBondsToFacilities = (deal, bonds, filters) => bonds.map((bond) => ({
  deal_id: deal._id, // eslint-disable-line no-underscore-dangle
  deal_status: deal.details.status,
  transaction_id: bond._id, // eslint-disable-line no-underscore-dangle
  bankFacilityId: bond.uniqueIdentificationNumber,
  ukefFacilityId: '//TODO',
  transactionType: 'bond',
  facilityValue: bond.facilityValue,
  transactionStage: bond.bondStage,
  issuedDate: '//TODO',
  maker: deal.details.maker ? `${deal.details.maker.firstname} ${deal.details.maker.surname}` : '',
  checker: deal.details.checker ? `${deal.details.checker.firstname} ${deal.details.checker.surname}` : '',
})).filter( (bondFacility) => {
  console.log("BOND FILTER")
  console.log(`bondFacility :: ${bondFacility.transaction_id}`)
  console.log(`filters :: ${JSON.stringify(filters)}`);

  return listOfGraphQlFiltersToTreatSpeciallyForBonds().reduce((acc, manualFilter) => {
    console.log(`acc:${acc} :: manualFilter:${manualFilter}`);

    const facilityFilter = bondMapField(manualFilter);
    const valueInFilter = filters[manualFilter];
    const valueInFilterMappedForBonds = bondMapFilterValue(manualFilter, facilityFilter, valueInFilter);
    const valueInFacility = bondFacility[facilityFilter];

    const filterOut = (valueInFilterMappedForBonds && valueInFilterMappedForBonds !== valueInFacility);
    console.log(`facilityFilter:${facilityFilter}`);
    console.log(`valueInFilter:${valueInFilter}`);
    console.log(`valueInFacility:${valueInFacility}  \n\n ${JSON.stringify(bondFacility)}`);

    console.log(`-> filterOut:${filterOut}`);
    return acc || !filterOut;
  }, false);
}, false);

const mapLoansToFacilities = (deal, loans, filters) => loans.map((loan) => ({
  deal_id: deal._id, // eslint-disable-line no-underscore-dangle
  deal_status: deal.details.status,
  transaction_id: loan._id, // eslint-disable-line no-underscore-dangle
  bankFacilityId: loan.bankReferenceNumber,
  ukefFacilityId: '//TODO',
  transactionType: 'loan',
  facilityValue: loan.facilityValue,
  transactionStage: loan.facilityStage,
  issuedDate: '//TODO',
  maker: deal.details.maker ? `${deal.details.maker.firstname} ${deal.details.maker.surname}` : '',
  checker: deal.details.checker ? `${deal.details.checker.firstname} ${deal.details.checker.surname}` : '',
})).filter( (loanFacility) => {
  console.log("LOAN FILTER")
  console.log(`loanFacility :: ${loanFacility.transaction_id}`)
  console.log(`filters :: ${JSON.stringify(filters)}`);

  return listOfGraphQlFiltersToTreatSpeciallyForLoans().reduce((acc, manualFilter) => {
    console.log(`acc:${acc} :: manualFilter:${manualFilter}`);

    const facilityFilter = loanMapField(manualFilter);
    const valueInFilter = filters[manualFilter];
    const valueInFilterMappedForLoans = loanMapFilterValue(manualFilter, facilityFilter, valueInFilter);
    const valueInFacility = loanFacility[facilityFilter];

    const filterOut = (valueInFilterMappedForLoans && valueInFilterMappedForLoans !== valueInFacility);
    console.log(`facilityFilter:${facilityFilter}`);
    console.log(`valueInFilter:${valueInFilter}`);
    console.log(`valueInFacility:${valueInFacility}  \n\n ${JSON.stringify(loanFacility)}`);

    console.log(`-> filterOut:${filterOut}`);
    return acc || !filterOut;
  }, false);
}, false);


exports.findPaginatedTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  const collection = await db.getCollection('deals');
  const query = transactionsQuery(requestingUser, filter);

  const dealResults = collection.find(query);
  const dealsWithTransactions = await dealResults.sort({ 'details.dateOfLastAction': -1 }).toArray();

  const reducer = (acc, deal) => {

    const bonds = deal.bondTransactions && deal.bondTransactions.items
      ? mapBondsToFacilities(deal, deal.bondTransactions.items, filter)
      : [];
    const loans = deal.loanTransactions && deal.loanTransactions.items
      ? mapLoansToFacilities(deal, deal.loanTransactions.items, filter)
      : [];

    return acc
      .concat(bonds)
      .concat(loans);
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
