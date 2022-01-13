const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const loanValidationErrors = require('../validation/loan');
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { loanStatus } = require('../section-status/loans');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const facilityBody = {
      facilityType: 'Loan',
      dealId: req.params.id,
      ...req.body,
    };

    const { status, data } = await facilitiesController.create(facilityBody, req.user);

    return res.status(status).send({
      ...data,
      loanId: data._id, // eslint-disable-line no-underscore-dangle
    });
  });
};

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

      const loan = await facilitiesController.findOne(loanId);

      if (loan) {
        const validationErrors = loanValidationErrors(loan, deal);

        return res.json({
          dealId,
          loan: {
            ...loan,
            status: loanStatus(loan, validationErrors),
          },
          validationErrors,
        });
      }
      return res.status(404).send();
    }
    return res.status(404).send();
  });
};

const facilityStageFields = (loan) => {
  const modifiedLoan = loan;
  const { facilityStage } = modifiedLoan;

  if (facilityStage === 'Conditional') {
    // remove any 'Unconditional' specific fields
    modifiedLoan.requestedCoverStartDate = null;
    modifiedLoan['requestedCoverStartDate-day'] = null;
    modifiedLoan['requestedCoverStartDate-month'] = null;
    modifiedLoan['requestedCoverStartDate-year'] = null;
    modifiedLoan['coverEndDate-day'] = null;
    modifiedLoan['coverEndDate-month'] = null;
    modifiedLoan['coverEndDate-year'] = null;
    modifiedLoan.disbursementAmount = null;
  }

  if (facilityStage === 'Unconditional') {
    // remove any 'Conditional' specific fields
    modifiedLoan.ukefGuaranteeInMonths = null;
  }

  return modifiedLoan;
};

const premiumTypeFields = (loan) => {
  const modifiedLoan = loan;
  const { premiumType } = modifiedLoan;
  if (premiumType === 'At maturity') {
    modifiedLoan.premiumFrequency = null;
  }

  return modifiedLoan;
};

exports.updateLoan = async (req, res) => {
  const {
    id: dealId,
    loanId,
  } = req.params;

  await findOneDeal(dealId, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const existingLoan = await facilitiesController.findOne(loanId);

      if (!existingLoan) {
        return res.status(404).send();
      }

      let modifiedLoan = {
        ...existingLoan,
        ...req.body,
      };

      modifiedLoan = facilityStageFields(modifiedLoan);

      modifiedLoan = await handleTransactionCurrencyFields(
        modifiedLoan,
        deal,
      );

      modifiedLoan = premiumTypeFields(modifiedLoan);

      const { value, coveredPercentage, interestMarginFee } = modifiedLoan;
      const sanitizedFacilityValue = sanitizeCurrency(value);

      modifiedLoan.guaranteeFeePayableByBank = calculateGuaranteeFee(interestMarginFee);
      if (sanitizedFacilityValue.sanitizedValue) {
        modifiedLoan.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
        modifiedLoan.value = sanitizedFacilityValue.sanitizedValue;
      }

      if (modifiedLoan.disbursementAmount) {
        const sanitizedFacilityDisbursement = sanitizeCurrency(modifiedLoan.disbursementAmount);
        if (sanitizedFacilityDisbursement.sanitizedValue) {
          modifiedLoan.disbursementAmount = sanitizedFacilityDisbursement.sanitizedValue;
        }
      }

      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
      } else {
        modifiedLoan.requestedCoverStartDate = null;
      }

      const { status, data } = await facilitiesController.update(
        dealId,
        loanId,
        modifiedLoan,
        req.user,
      );

      const validationErrors = loanValidationErrors(data, deal);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: data,
        });
      }

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};

exports.deleteLoan = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const { status, data } = await facilitiesController.delete(loanId, req.user);

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};
