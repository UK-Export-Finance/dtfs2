const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const loanValidationErrors = require('../validation/loan');
const { generateFacilityId } = require('../../utils/generateIds');
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const { loanStatus } = require('../section-status/loan');
const { sanitizeCurrency } = require('../../utils/number');
const now = require('../../now');

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
            status: loanStatus(validationErrors),
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

    const updateDealResponse = await updateDeal(newReq);

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

const premiumTypeFields = (loan) => {
  const modifiedLoan = loan;
  const { premiumType } = modifiedLoan;
  if (premiumType === 'At maturity') {
    delete modifiedLoan.premiumFrequency;
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

      const loan = deal.loanTransactions.items.find((loan) =>
        String(loan._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!loan) {
        return res.status(404).send();
      }

      const allOtherLoans = deal.loanTransactions.items.filter((loan) =>
        String(loan._id) !== loanId); // eslint-disable-line no-underscore-dangle

      let modifiedLoan = {
        _id: loanId,
        ...loan,
        ...req.body,
      };

      modifiedLoan = loanFacilityStageFields(modifiedLoan);

      modifiedLoan = await handleTransactionCurrencyFields(
        modifiedLoan,
        deal,
      );

      modifiedLoan = premiumTypeFields(modifiedLoan);

      const { facilityValue, coveredPercentage, interestMarginFee } = modifiedLoan;
      const sanitizedFacilityValue = sanitizeCurrency(facilityValue);

      modifiedLoan.guaranteeFeePayableByBank = calculateGuaranteeFee(interestMarginFee);
      if (sanitizedFacilityValue.sanitizedValue) {
        modifiedLoan.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
        modifiedLoan.facilityValue = sanitizedFacilityValue.sanitizedValue;
      }

      const sanitizedFacilityDisbursement = sanitizeCurrency(modifiedLoan.disbursementAmount);
      if (sanitizedFacilityDisbursement.sanitizedValue) {
        modifiedLoan.disbursementAmount = sanitizedFacilityDisbursement.sanitizedValue;
      }

      modifiedLoan.lastEdited = now();

      const modifiedDeal = putLoanInDealObject(deal, modifiedLoan, allOtherLoans);

      const newReq = {
        params: req.params,
        body: modifiedDeal,
        user: req.user,
      };

      const dealAfterAllUpdates = await updateDeal(newReq);

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



exports.updateLoanIssueFacility = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((loan) =>
        String(loan._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!loan) {
        return res.status(404).send();
      }

      const allOtherLoans = deal.loanTransactions.items.filter((loan) =>
        String(loan._id) !== loanId); // eslint-disable-line no-underscore-dangle

      let modifiedLoan = {
        _id: loanId,
        ...loan,
        ...req.body,
      };

      const modifiedDeal = putLoanInDealObject(deal, modifiedLoan, allOtherLoans);

      const newReq = {
        params: req.params,
        body: modifiedDeal,
        user: req.user,
      };

      const dealAfterAllUpdates = await updateDeal(newReq);

      const loanInDealAfterAllUpdates = dealAfterAllUpdates.loanTransactions.items.find((l) =>
        String(l._id) === loanId); // eslint-disable-line no-underscore-dangle

      return res.status(200).send(loanInDealAfterAllUpdates);
    }
    return res.status(404).send();

  });
};
