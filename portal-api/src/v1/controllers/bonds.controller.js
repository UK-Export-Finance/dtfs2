const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { isValidMongoId } = require('../validation/validateIds');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const bondValidationErrors = require('../validation/bond');
const { bondStatus } = require('../section-status/bonds');
const { calculateGuaranteeFee, calculateUkefExposure } = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate } = require('../facility-dates/requested-cover-start-date');
const { hasAllCoverEndDateValues, updateCoverEndDate } = require('../facility-dates/cover-end-date');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

exports.create = async (req, res) => {
  if (!isValidMongoId(req?.params?.id)) {
    console.error('Create bond API failed for deal id %s', req.params.id);
    return res.status(400).send({ status: 400, message: 'Invalid id provided' });
  }

  return findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const facilityBody = {
      type: 'Bond',
      dealId: req.params.id,
      ...req.body,
    };

    const auditDetails = generatePortalAuditDetails(req.user._id);

    const { status, data } = await facilitiesController.create(facilityBody, req.user, auditDetails);

    return res.status(status).send({
      ...data,
      bondId: data._id,
    });
  });
};

exports.getBond = async (req, res) => {
  const { id: dealId, bondId } = req.params;

  if (!isValidMongoId(req?.params?.id) || !isValidMongoId(req?.params?.bondId)) {
    console.error('Get bond API failed for deal/bond id %s', req.params.id, req.params.loanId);
    return res.status(400).send({ status: 400, message: 'Invalid deal or bond id provided' });
  }

  return findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const bond = await facilitiesController.findOne(bondId);

      if (bond) {
        const validationErrors = bondValidationErrors(bond, deal);

        return res.json({
          dealId,
          bond: {
            ...bond,
            status: bondStatus(bond, validationErrors),
          },
          validationErrors,
        });
      }

      return res.status(404).send();
    }
    return res.status(404).send();
  });
};

const facilityStageFields = (bond) => {
  const modifiedBond = bond;
  const { facilityStage } = modifiedBond;

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED) {
    // remove any `Unissued Facility Stage` specific fields/values
    modifiedBond.ukefGuaranteeInMonths = null;
    modifiedBond.hasBeenIssued = true;
  }

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
    // remove any `Issued Facility Stage` specific fields/values
    modifiedBond.requestedCoverStartDate = null;
    modifiedBond['requestedCoverStartDate-day'] = null;
    modifiedBond['requestedCoverStartDate-month'] = null;
    modifiedBond['requestedCoverStartDate-year'] = null;
    modifiedBond['coverEndDate-day'] = null;
    modifiedBond['coverEndDate-month'] = null;
    modifiedBond['coverEndDate-year'] = null;
    modifiedBond.name = null;
    modifiedBond.hasBeenIssued = false;
  }

  return modifiedBond;
};

const feeTypeFields = (bond) => {
  const modifiedBond = bond;
  const { feeType } = modifiedBond;
  if (feeType === 'At maturity') {
    modifiedBond.feeFrequency = null;
  }

  return modifiedBond;
};

exports.updateBond = async (req, res) => {
  const {
    user,
    params: { id: dealId, bondId },
  } = req;
  const auditDetails = generatePortalAuditDetails(user._id);

  await findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(user, deal)) {
      res.status(401).send();
    }

    const existingBond = await facilitiesController.findOne(bondId);

    if (!existingBond) {
      return res.status(404).send();
    }

    let modifiedBond = {
      ...existingBond,
      ...req.body,
    };

    modifiedBond = facilityStageFields(modifiedBond);

    modifiedBond = await handleTransactionCurrencyFields(modifiedBond, deal);

    modifiedBond = feeTypeFields(modifiedBond);

    const { value, coveredPercentage, riskMarginFee } = modifiedBond;
    const sanitizedFacilityValue = sanitizeCurrency(value);

    modifiedBond.guaranteeFeePayableByBank = calculateGuaranteeFee(riskMarginFee);

    if (sanitizedFacilityValue.sanitizedValue) {
      modifiedBond.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
      modifiedBond.value = sanitizedFacilityValue.sanitizedValue;
    }

    if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
      modifiedBond = updateRequestedCoverStartDate(modifiedBond);
    } else {
      modifiedBond.requestedCoverStartDate = null;
    }

    if (hasAllCoverEndDateValues(modifiedBond)) {
      modifiedBond = updateCoverEndDate(modifiedBond);
    } else {
      modifiedBond.coverEndDate = null;
    }

    const { status, data } = await facilitiesController.update(dealId, bondId, modifiedBond, user, auditDetails);

    const validationErrors = bondValidationErrors(data, deal);
    if (validationErrors.count !== 0) {
      return res.status(400).send({
        validationErrors,
        bond: data,
      });
    }

    return res.status(status).send(data);
  });
};

exports.deleteBond = async (req, res) => {
  const { bondId } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const { status, data } = await facilitiesController.delete(bondId, req.user, generatePortalAuditDetails(req.user._id));

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};
