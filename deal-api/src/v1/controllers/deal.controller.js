const assert = require('assert');
const moment = require('moment');
const $ = require('mongo-dot-notation');

const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const { getDealErrors } = require('../validation/deal');

const { isSuperUser, userHasAccessTo } = require('../users/checks');
const { generateDealId } = require('../../utils/generateIds');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');

const { roundNumber } = require('../../utils/number');

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

const findOneDeal = async (_id, callback) => {
  const collection = await db.getCollection('deals');
  if (callback) {
    collection.findOne({ _id }, (err, result) => {
      assert.equal(err, null);
      callback(result);
    });
  }
  return collection.findOne({ _id });
};
exports.findOneDeal = findOneDeal;

const createDeal = async (req, res) => {
  const collection = await db.getCollection('deals');

  const timestamp = moment().format('YYYY MM DD HH:mm:ss:SSS ZZ');

  const dealId = await generateDealId();

  const newDeal = {
    _id: dealId,
    ...DEFAULTS.DEALS,
    ...req.body,
    details: {
      ...DEFAULTS.DEALS.details,
      ...req.body.details,
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
      // apply realtime validation so we catch any time-dependent fields
      //  that have -become- invalid..
      const validationErrors = validate(deal);
      const dealWithStatuses = calculateStatuses(deal, validationErrors);

      // TODO: should the summary only be generated when XYZ completed?
      // TODO should be calculated on PUT and added to the deal

      const bonds = deal.bondTransactions.items;
      const loans = deal.loanTransactions.items;

      const hasBonds = bonds.length > 0;
      const hasLoans = loans.length > 0;

      const hasBondsOrLoans = (hasBonds || hasLoans);

      let temp = dealWithStatuses;

      if (hasBondsOrLoans) {
        const { supplyContractConversionRateToGBP } = deal.submissionDetails;
        const supplyContractConversionRateToGbp = Number(supplyContractConversionRateToGBP);

        let bondsTotalFacilityValue = 0;
        let loansTotalFacilityValue = 0;
        let bondCurrency = 0;
        let loanCurrency = 0;

        if (hasBonds) {
          bonds.forEach((bond) => {
            bondsTotalFacilityValue += Number(bond.facilityValue);
            bondCurrency += (Number(bond.facilityValue) / Number(bond.conversionRate));
          });
        }

        if (hasLoans) {
          loans.forEach((loan) => {
            loansTotalFacilityValue += Number(loan.facilityValue);
            loanCurrency += (Number(loan.facilityValue) / Number(loan.conversionRate));
          });
        }

        const dealCurrency = bondCurrency + loanCurrency;

        // TODO: dealInGbp maybe incorrect. Need business clarification
        const bondsAndLoansTotalFacilityValue = (bondsTotalFacilityValue + loansTotalFacilityValue);
        const dealInGbp = (bondsAndLoansTotalFacilityValue / supplyContractConversionRateToGbp);

        const bondInGbp = (bondCurrency / supplyContractConversionRateToGbp);
        const loanInGbp = (loanCurrency / supplyContractConversionRateToGbp);

        const formattedNumber = (numb) => roundNumber(numb, 2).toLocaleString('en', { minimumFractionDigits: 2 });

        const formattedDealCurrency = formattedNumber(dealCurrency);
        const formattedBondCurrency = formattedNumber(bondCurrency);
        const formattedLoanCurrency = formattedNumber(loanCurrency);
        const formattedBondInGbp = formattedNumber(bondInGbp);
        const formattedLoanInGbp = formattedNumber(loanInGbp);

        temp = {
          ...dealWithStatuses,
          summary: {
            dealBondsLoans: {
              totalValue: {
                dealCurrency: formattedDealCurrency,
                dealInGbp,
                bondCurrency: formattedBondCurrency,
                loanCurrency: formattedLoanCurrency,
                bondInGbp: formattedBondInGbp,
                loanInGbp: formattedLoanInGbp,
              },
            },
          },
        };
      }

      res.status(200).send({
        deal: temp,
        validationErrors,
      });
    }
  });
};

const updateDeal = async (req) => {
  const collection = await db.getCollection('deals');

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: req.params.id },
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
        const status = await collection.deleteOne({ _id: req.params.id });
        res.status(200).send(status);
      }
    }
  });
};
