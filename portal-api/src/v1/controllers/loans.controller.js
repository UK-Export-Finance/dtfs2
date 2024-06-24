const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { isValidMongoId } = require('../validation/validateIds');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const loanValidationErrors = require('../validation/loan');
const { calculateGuaranteeFee, calculateUkefExposure } = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate } = require('../facility-dates/requested-cover-start-date');
const { hasAllCoverEndDateValues, updateCoverEndDate } = require('../facility-dates/cover-end-date');
const { loanStatus } = require('../section-status/loans');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

exports.create = async (req, res) => {
  const {
    user,
    params: { id: dealId },
    body,
  } = req;
  if (!isValidMongoId(dealId)) {
    console.error('Create loans API failed for deal id %s', dealId);
    return res.status(400).send({ status: 400, message: 'Invalid id provided' });
  }

  return findOneDeal(dealId, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const facilityBody = {
      type: 'Loan',
      dealId,
      ...body,
    };

    const auditDetails = generatePortalAuditDetails(user._id);

    const { status, data } = await facilitiesController.create(facilityBody, user, auditDetails);

    return res.status(status).send({
      ...data,
      loanId: data._id,
    });
  });
};

exports.getLoan = async (req, res) => {
  const { id: dealId, loanId } = req.params;

  if (!isValidMongoId(req?.params?.id) || !isValidMongoId(req?.params?.loanId)) {
    console.error('Get loan API failed for deal/loan id %s', req.params.id, req.params.loanId);
    return res.status(400).send({ status: 400, message: 'Invalid id provided' });
  }

  return findOneDeal(req.params.id, async (deal) => {
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

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
    // remove any 'Unconditional' specific fields
    modifiedLoan.requestedCoverStartDate = null;
    modifiedLoan['requestedCoverStartDate-day'] = null;
    modifiedLoan['requestedCoverStartDate-month'] = null;
    modifiedLoan['requestedCoverStartDate-year'] = null;
    modifiedLoan['coverEndDate-day'] = null;
    modifiedLoan['coverEndDate-month'] = null;
    modifiedLoan['coverEndDate-year'] = null;
    modifiedLoan.disbursementAmount = null;
    modifiedLoan.hasBeenIssued = false;
  }

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) {
    // remove any 'Conditional' specific fields
    modifiedLoan.ukefGuaranteeInMonths = null;
    modifiedLoan.hasBeenIssued = true;
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
    params: { id: dealId, loanId },
    user,
    body: update,
  } = req;

  const auditDetails = generatePortalAuditDetails(user._id);

  await findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(user, deal)) {
      res.status(401).send();
    }

    const existingLoan = await facilitiesController.findOne(loanId);

    if (!existingLoan) {
      return res.status(404).send();
    }

    let modifiedLoan = {
      ...existingLoan,
      ...update,
    };

    modifiedLoan = facilityStageFields(modifiedLoan);

    modifiedLoan = await handleTransactionCurrencyFields(modifiedLoan, deal);

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

    if (hasAllCoverEndDateValues(modifiedLoan)) {
      modifiedLoan = updateCoverEndDate(modifiedLoan);
    } else {
      modifiedLoan.coverEndDate = null;
    }

    const { status, data } = await facilitiesController.update(dealId, loanId, modifiedLoan, user, auditDetails);

    const validationErrors = loanValidationErrors(data, deal);

    if (validationErrors.count !== 0) {
      return res.status(400).send({
        validationErrors,
        loan: data,
      });
    }

    return res.status(status).send(data);
  });
};

exports.deleteLoan = async (req, res) => {
  const { loanId } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const { status, data } = await facilitiesController.delete(loanId, req.user, generatePortalAuditDetails(req.user._id));

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};
