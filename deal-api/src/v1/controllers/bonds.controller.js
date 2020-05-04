const { ObjectId } = require('mongodb');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { findOneBondCurrency } = require('./bondCurrencies.controller');
const { getBondErrors } = require('../validation/bond');

exports.getBond = async (req, res) => {
  const {
    id: dealId,
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const bond = deal.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (bond) {
        const validationErrors = getBondErrors(bond);

        // TODO: should we do ...bond ?
        return res.json({
          dealId,
          bond,
          validationErrors,
        });
      }
      return res.status(404).send();
    }
    return res.status(404).send();
  });
};

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const newBondObj = { _id: new ObjectId() };

    const updatedDeal = {
      ...deal,
      bondTransactions: {
        items: [
          ...deal.bondTransactions.items,
          newBondObj,
        ],
      },
    };

    const newReq = {
      params: req.params,
      body: updatedDeal,
      user: req.user,
    };

    const updateDealResponse = await updateDeal(newReq, res);

    return res.status(200).send({
      ...updateDealResponse,
      bondId: newBondObj._id, // eslint-disable-line no-underscore-dangle
    });
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
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const existingBond = deal.bondTransactions.items.find((bond) =>
        String(bond._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!existingBond) {
        return res.status(404).send();
      }

      const allOtherBonds = deal.bondTransactions.items.filter((bond) =>
        String(bond._id) !== bondId); // eslint-disable-line no-underscore-dangle

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
        // remove any 'currency is NOT the same' specific values
        delete updatedBond.conversionRate;
        delete updatedBond['conversionRateDate-day'];
        delete updatedBond['conversionRateDate-month'];
        delete updatedBond['conversionRateDate-year'];

        const supplyContractCurrencyCode = deal.supplyContractCurrency.id;
        updatedBond.currency = await handleBondCurrency(supplyContractCurrencyCode);
      } else if (currencyCode) {
        updatedBond.currency = await handleBondCurrency(currencyCode);
      }

      const requiredFieldsCompleted = false;

      if (!requiredFieldsCompleted) {
        updatedBond.status = 'Incomplete';
      }

      // if (requiredFieldsCompleted) {
      //   updatedBond.status = 'Complete';
      // }

      const updatedDeal = {
        ...deal,
        bondTransactions: {
          items: [
            ...allOtherBonds,
            updatedBond,
          ],
        },
      };

      const newReq = {
        params: req.params,
        body: updatedDeal,
        user: req.user,
      };

      const updateDealResponse = await updateDeal(newReq, res);

      return res.status(200).send(updateDealResponse);
    }
    return res.status(404).send();
  });
};
