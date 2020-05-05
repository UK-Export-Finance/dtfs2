const assert = require('assert');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const $ = require('mongo-dot-notation');

const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const { getDealErrors } = require('../validation/deal');
const { getCloneDealErrors } = require('../validation/clone-deal');

const { isSuperUser, userHasAccessTo } = require('../users/checks');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const dealsQuery = (user, filter) => {
  let query = {};
  if (filter && filter !== {}) {
    query = { ...filter };
  }

  if (!isSuperUser(user)) {
    query['details.owningBank.id'] = { $eq: user.bank.id };
  }

  return query;
};

const findDeals = async (requestingUser, filter) => {
  const collection = await db.getCollection('deals');

  const dealResults = collection.find(dealsQuery(requestingUser, filter));

  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ 'details.dateOfLastAction': -1 })
    .toArray();

  return {
    count,
    deals,
  };
};
exports.findDeals = findDeals;

const findPaginatedDeals = async (requestingUser, start = 0, pagesize = 20, filter) => {
  const collection = await db.getCollection('deals');

  const query = dealsQuery(requestingUser, filter);

  const dealResults = collection.find(query);

  const count = await dealResults.count();
  const deals = await dealResults
    .sort({ 'details.dateOfLastAction': -1 })
    .skip(start)
    .limit(pagesize)
    .toArray();

  return {
    count,
    deals,
  };
};
exports.findPaginatedDeals = findPaginatedDeals;

const findOneDeal = async (id, callback) => {
  const collection = await db.getCollection('deals');
  if (callback) {
    collection.findOne({ _id: new ObjectId(id) }, (err, result) => {
      assert.equal(err, null);
      callback(result);
    });
  }
  return collection.findOne({ _id: new ObjectId(id) });
};
exports.findOneDeal = findOneDeal;

const createDeal = async (req, res) => {
  const collection = await db.getCollection('deals');

  const timestamp = moment().format('YYYY MM DD HH:mm:ss:SSS ZZ');

  const newDeal = {
    ...DEFAULTS.DEALS,
    ...req.body,
    details: {
      ...DEFAULTS.DEALS.details,
      ...req.body.details,
      submissionDate: timestamp,
      dateOfLastAction: timestamp,
      maker: req.user,
      owningBank: req.user.bank,
    },
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors) {
    return res.status(400).send({
      ...newDeal,
      validationErrors,
    });
  }

  const response = await collection.insertOne(newDeal);

  const createdDeal = response.ops[0];
  return res.status(200).send(createdDeal);
};

exports.create = async (req, res) => {
  const result = await createDeal(req, res);
  return result;
};

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      res.status(200).send(deal);
    }
  });
};

const updateDeal = async (req) => {
  const collection = await db.getCollection('deals');

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: new ObjectId(req.params.id) } },
    $.flatten(withoutId(req.body)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;
  return value;
};
exports.updateDeal = updateDeal;

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const updatedDeal = await updateDeal(req);
        res.status(200).json(updatedDeal);
      }
    }
    res.status(404).send();
  });
};

exports.delete = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const collection = await db.getCollection('deals');
        const status = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(200).send(status);
      }
    }
  });
};

exports.clone = async (req, res) => {
  await findOneDeal(req.params.id, (existingDeal) => {
    if (!existingDeal) {
      return res.status(404).send();
    }

    const {
      bankSupplyContractID,
      bankSupplyContractName,
      cloneTransactions,
    } = req.body;

    const modifiedDeal = {
      ...existingDeal,
      _id: new ObjectId(),
      details: {
        bankSupplyContractID,
        bankSupplyContractName,
      },
    };

    if (cloneTransactions === 'false') {
      modifiedDeal.bondTransactions = DEFAULTS.DEALS.bondTransactions;
      modifiedDeal.loanTransactions = DEFAULTS.DEALS.loanTransactions;
    }

    const validationErrors = getCloneDealErrors(modifiedDeal, cloneTransactions);

    if (validationErrors) {
      return res.status(400).send({
        ...modifiedDeal,
        validationErrors,
      });
    }

    req.body = modifiedDeal;
    return createDeal(req, res);
  });
};
