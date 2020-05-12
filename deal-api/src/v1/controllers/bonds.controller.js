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

    const newBondObj = {
      _id: new ObjectId(),
      status: 'Not started',
    };

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
        delete updatedBond.currency;
        delete updatedBond.conversionRate;
        delete updatedBond['conversionRateDate-day'];
        delete updatedBond['conversionRateDate-month'];
        delete updatedBond['conversionRateDate-year'];

        const supplyContractCurrencyCode = deal.supplyContractCurrency.id;
        updatedBond.currency = await handleBondCurrency(supplyContractCurrencyCode);
      } else if (currencyCode) {
        // TODO: make this clearer
        // currencyCode can be a single string (from form),
        // or an object with ID, if has been previously submitted.
        const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
        updatedBond.currency = await handleBondCurrency(actualCurrencyCode);
      }

      const validationErrors = getBondErrors(updatedBond);

      if (!validationErrors) {
        updatedBond.status = 'Complete';
      } else {
        updatedBond.status = 'Incomplete';
      }

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
      const updateDealResponseBond = updateDealResponse.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (validationErrors) {
        return res.status(400).send({
          validationErrors,
          bond: updateDealResponseBond,
        });
      }

      return res.status(200).send(updateDealResponseBond);
    }
    return res.status(404).send();
  });
};
