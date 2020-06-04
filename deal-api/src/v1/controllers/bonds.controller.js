const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { findOneBondCurrency } = require('./bondCurrencies.controller');
const bondValidationErrors = require('../validation/bond');
const { generateFacilityId } = require('../../utils/generateIds');
const { bondStatus } = require('../section-status/bond');
const { hasValue } = require('../../utils/string');

const putBondInDealObject = (deal, bond, otherBonds) => ({
  ...deal,
  bondTransactions: {
    items: [
      ...otherBonds,
      bond,
    ],
  },
});

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
        const validationErrors = bondValidationErrors(bond);

        return res.json({
          dealId,
          bond: {
            ...bond,
            status: bondStatus(validationErrors),
          },
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

    const facilityId = await generateFacilityId();

    const newBondObj = {
      _id: facilityId,
    };

    const modifiedDeal = putBondInDealObject(deal, newBondObj, deal.bondTransactions.items);

    const newReq = {
      params: req.params,
      body: modifiedDeal,
      user: req.user,
    };

    const updateDealResponse = await updateDeal(newReq, res);

    return res.status(200).send({
      ...updateDealResponse,
      bondId: newBondObj._id, // eslint-disable-line no-underscore-dangle
    });
  });
};

const bondCurrency = async (currencyCode) => {
  const currencyObj = await findOneBondCurrency(currencyCode);
  const { text, id } = currencyObj;

  return {
    text,
    id,
  };
};

const bondTransactionCurrencySameAsSupplyContractCurrency = async (bond, supplyContractCurrencyCode) => {
  const modifiedBond = bond;
  const {
    transactionCurrencySameAsSupplyContractCurrency,
    currency: currencyCode,
  } = modifiedBond;

  if (transactionCurrencySameAsSupplyContractCurrency && transactionCurrencySameAsSupplyContractCurrency === 'true') {
    // remove any 'currency is NOT the same' specific values
    delete modifiedBond.currency;
    delete modifiedBond.conversionRate;
    delete modifiedBond['conversionRateDate-day'];
    delete modifiedBond['conversionRateDate-month'];
    delete modifiedBond['conversionRateDate-year'];

    modifiedBond.currency = await bondCurrency(supplyContractCurrencyCode);
  } else if (currencyCode) {
    // TODO: make this clearer
    // currencyCode can be a single string (from form),
    // or an object with ID, if has been previously submitted.
    const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
    modifiedBond.currency = await bondCurrency(actualCurrencyCode);
  }

  return modifiedBond;
};

const bondStageFields = (bond) => {
  const modifiedBond = bond;
  const { bondStage } = modifiedBond;

  if (bondStage === 'Issued') {
    // remove any `Unissued Bond Stage` specific fields/values
    delete modifiedBond.ukefGuaranteeInMonths;
  }

  if (bondStage === 'Unissued') {
    // remove any `Issued Bond Stage` specific fields/values
    delete modifiedBond['requestedCoverStartDate-day'];
    delete modifiedBond['requestedCoverStartDate-month'];
    delete modifiedBond['requestedCoverStartDate-year'];
    delete modifiedBond['coverEndDate-day'];
    delete modifiedBond['coverEndDate-month'];
    delete modifiedBond['coverEndDate-year'];
    delete modifiedBond.uniqueIdentificationNumber;
  }

  return modifiedBond;
};

const calculateGuaranteeFeePayableByBank = (riskMarginFee) => {
  if (hasValue(riskMarginFee)) {
    return riskMarginFee * 0.9;
  }
  return riskMarginFee;
};

const calculateUkefExposure = (bondValue, coveredPercentage) => {
  if (hasValue(bondValue) && hasValue(coveredPercentage)) {
    return bondValue * coveredPercentage;
  }
  return '';
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

      let modifiedBond = {
        _id: bondId,
        ...existingBond,
        ...req.body,
      };

      modifiedBond = bondStageFields(modifiedBond);

      const supplyContractCurrencyCode = deal.supplyContractCurrency.id;

      modifiedBond = await bondTransactionCurrencySameAsSupplyContractCurrency(
        modifiedBond,
        supplyContractCurrencyCode,
      );

      const { bondValue, coveredPercentage, riskMarginFee } = modifiedBond;

      modifiedBond.guaranteeFeePayableByBank = calculateGuaranteeFeePayableByBank(riskMarginFee);

      modifiedBond.ukefExposure = calculateUkefExposure(bondValue, coveredPercentage);

      const modifiedDeal = putBondInDealObject(deal, modifiedBond, allOtherBonds);

      const newReq = {
        params: req.params,
        body: modifiedDeal,
        user: req.user,
      };

      const dealAfterAllUpdates = await updateDeal(newReq, res);

      const bondInDealAfterAllUpdates = dealAfterAllUpdates.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      const validationErrors = bondValidationErrors(bondInDealAfterAllUpdates);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          bond: bondInDealAfterAllUpdates,
        });
      }

      return res.status(200).send(bondInDealAfterAllUpdates);
    }
    return res.status(404).send();
  });
};
