const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { findOneBondCurrency } = require('./bondCurrencies.controller');
const loanValidationErrors = require('../validation/loan');
const { generateFacilityId } = require('../../utils/generateIds');
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../section-calculations');
// const { loanStatus } = require('../section-status/loan');

const putLoanInDealObject = (deal, loan, otherLoans) => ({
  ...deal,
  loanTransactions: {
    items: [
      ...otherLoans,
      loan,
    ],
  },
});

exports.getLoan = async (req, res) => {
  const {
    id: dealId,
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((b) =>
        String(b._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (loan) {
        const validationErrors = loanValidationErrors(loan);

        return res.json({
          dealId,
          loan: {
            ...loan,
            // status: loanStatus(validationErrors),
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

    const newLoanObj = {
      _id: facilityId,
    };

    const modifiedDeal = putLoanInDealObject(deal, newLoanObj, deal.loanTransactions.items);

    const newReq = {
      params: req.params,
      body: modifiedDeal,
      user: req.user,
    };

    const updateDealResponse = await updateDeal(newReq, res);

    return res.status(200).send({
      ...updateDealResponse,
      loanId: newLoanObj._id, // eslint-disable-line no-underscore-dangle
    });
  });
};

const loanFacilityStageFields = (loan) => {
  const modifiedLoan = loan;
  const { facilityStage } = modifiedLoan;

  if (facilityStage === 'Conditional') {
    // remove any 'Unconditional' specific fields

    delete modifiedLoan['requestedCoverStartDate-day'];
    delete modifiedLoan['requestedCoverStartDate-month'];
    delete modifiedLoan['requestedCoverStartDate-year'];
    delete modifiedLoan['coverEndDate-day'];
    delete modifiedLoan['coverEndDate-month'];
    delete modifiedLoan['coverEndDate-year'];
    delete modifiedLoan.disbursementAmount;
  }

  if (facilityStage === 'Unconditional') {
    // remove any 'Conditional' specific fields
    delete modifiedLoan.ukefGuaranteeInMonths;
  }

  return modifiedLoan;
};

const loanCurrency = async (currencyCode) => {
  const currencyObj = await findOneBondCurrency(currencyCode);
  const { text, id } = currencyObj;

  return {
    text,
    id,
  };
};

const loanCurrencySameAsSupplyContractCurrency = async (loan, supplyContractCurrencyCode) => {
  const modifiedLoan = loan;
  const {
    currencySameAsSupplyContractCurrency,
    currency: currencyCode,
  } = modifiedLoan;

  if (currencySameAsSupplyContractCurrency && currencySameAsSupplyContractCurrency === 'true') {
    // remove any 'currency is NOT the same' specific values
    delete modifiedLoan.currency;
    delete modifiedLoan.conversionRate;
    delete modifiedLoan['conversionRateDate-day'];
    delete modifiedLoan['conversionRateDate-month'];
    delete modifiedLoan['conversionRateDate-year'];

    modifiedLoan.currency = await loanCurrency(supplyContractCurrencyCode);
  } else if (currencyCode) {
    // TODO: make this clearer
    // currencyCode can be a single string (from form),
    // or an object with ID, if has been previously submitted.
    const actualCurrencyCode = currencyCode.id ? currencyCode.id : currencyCode;
    modifiedLoan.currency = await loanCurrency(actualCurrencyCode);
  }

  return modifiedLoan;
};

exports.updateLoan = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const existingLoan = deal.loanTransactions.items.find((loan) =>
        String(loan._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!existingLoan) {
        return res.status(404).send();
      }

      const allOtherLoans = deal.loanTransactions.items.filter((loan) =>
        String(loan._id) !== loanId); // eslint-disable-line no-underscore-dangle

      let modifiedLoan = {
        _id: loanId,
        ...existingLoan,
        ...req.body,
      };

      modifiedLoan = loanFacilityStageFields(modifiedLoan);

      const supplyContractCurrencyCode = deal.supplyContractCurrency.id;

      modifiedLoan = await loanCurrencySameAsSupplyContractCurrency(
        modifiedLoan,
        supplyContractCurrencyCode,
      );

      const { facilityValue, coveredPercentage, interestMarginFee } = modifiedLoan;

      modifiedLoan.guaranteeFeePayableByBank = calculateGuaranteeFee(interestMarginFee);

      modifiedLoan.ukefExposure = calculateUkefExposure(facilityValue, coveredPercentage);

      const modifiedDeal = putLoanInDealObject(deal, modifiedLoan, allOtherLoans);

      const newReq = {
        params: req.params,
        body: modifiedDeal,
        user: req.user,
      };

      const dealAfterAllUpdates = await updateDeal(newReq, res);

      const loanInDealAfterAllUpdates = dealAfterAllUpdates.loanTransactions.items.find((l) =>
        String(l._id) === loanId); // eslint-disable-line no-underscore-dangle

      const validationErrors = loanValidationErrors(loanInDealAfterAllUpdates);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: loanInDealAfterAllUpdates,
        });
      }

      return res.status(200).send(loanInDealAfterAllUpdates);
    }
    return res.status(404).send();
  });
};
