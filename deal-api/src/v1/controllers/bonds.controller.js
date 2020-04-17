const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { findOneBondCurrency } = require('./bondCurrencies.controller');

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const collection = await db.getCollection('deals');

      const newBondObj = { _id: new ObjectId() };

      const updatedDeal = await collection.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $push: { 'bondTransactions.items': { ...newBondObj } } },
        { upsert: false },
        { returnOriginal: false },
      );

      return res.status(200).send({
        ...updatedDeal.value,
        bondId: newBondObj._id, // eslint-disable-line no-underscore-dangle
      });
    }
    return res.status(404).send();
  });
};

const handleBondCurrency = async (currencyCode) => {
  const currencyObj = await findOneBondCurrency(currencyCode);
  const { text, id } = currencyObj;

  return {
    text,
    id,
  };
};

exports.updateBond = async (req, res) => {
  const {
    id: dealId,
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const existingBond = deal.bondTransactions.items.find((bond) =>
        String(bond._id) === bondId); // eslint-disable-line no-underscore-dangle

      const updatedBond = {
        _id: ObjectId(bondId),
        ...existingBond,
        ...req.body,
      };

      const {
        bondStage,
        transactionCurrencySameAsSupplyContractCurrency,
        currency: currencyCode,
      } = req.body;

      if (bondStage === 'Issued') {
        // remove any `Unissued Bond Stage` specific values
        delete updatedBond.ukefGuaranteeInMonths;
      }

      if (bondStage === 'Unissued') {
        // remove any `Issued Bond Stage` specific values
        delete updatedBond['requestedCoverStartDate-day'];
        delete updatedBond['requestedCoverStartDate-month'];
        delete updatedBond['requestedCoverStartDate-year'];
        delete updatedBond['coverEndDate-day'];
        delete updatedBond['coverEndDate-month'];
        delete updatedBond['coverEndDate-year'];
        delete updatedBond.uniqueIdentificationNumber;
      }

      if (transactionCurrencySameAsSupplyContractCurrency && transactionCurrencySameAsSupplyContractCurrency === 'true') {
        // remove any 'currency is NOT the same values'
        delete updatedBond.conversionRate;
        delete updatedBond['conversionRateDate-day'];
        delete updatedBond['conversionRateDate-month'];
        delete updatedBond['conversionRateDate-year'];

        const supplyContractCurrencyCode = deal.supplyContractCurrency.id;
        updatedBond.currency = await handleBondCurrency(supplyContractCurrencyCode);
      } else if (currencyCode) {
        updatedBond.currency = await handleBondCurrency(currencyCode);
      }

      const collection = await db.getCollection('deals');
      const result = await collection.findOneAndUpdate(
        {
          _id: ObjectId(dealId),
          'bondTransactions.items._id': ObjectId(bondId),
        }, {
          $set: { 'bondTransactions.items.$': { ...updatedBond } },
        },
        { upsert: false },
      );

      // TODO: error handling for if deal not found.

      return res.status(200).send(result.value);
    }
    return res.status(404).send();
  });
};
