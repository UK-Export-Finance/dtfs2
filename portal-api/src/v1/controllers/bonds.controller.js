const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const bondValidationErrors = require('../validation/bond');
const { bondStatus } = require('../section-status/bonds');
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const facilityBody = {
      facilityType: 'bond',
      associatedDealId: req.params.id,
    };

    const { status, data } = await facilitiesController.create(facilityBody, req.user);

    return res.status(status).send({
      ...data,
      bondId: data._id, // eslint-disable-line no-underscore-dangle
    });
  });
};

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

  if (facilityStage === 'Issued') {
    // remove any `Unissued Facility Stage` specific fields/values
    delete modifiedBond.ukefGuaranteeInMonths;
  }

  if (facilityStage === 'Unissued') {
    // remove any `Issued Facility Stage` specific fields/values
    delete modifiedBond.requestedCoverStartDate;
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

const feeTypeFields = (bond) => {
  const modifiedBond = bond;
  const { feeType } = modifiedBond;
  if (feeType === 'At maturity') {
    delete modifiedBond.feeFrequency;
  }

  return modifiedBond;
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

      const existingBond = await facilitiesController.findOne(bondId);

      if (!existingBond) {
        return res.status(404).send();
      }

      let modifiedBond = {
        ...existingBond,
        ...req.body,
      };

      modifiedBond = facilityStageFields(modifiedBond);

      modifiedBond = await handleTransactionCurrencyFields(
        modifiedBond,
        deal,
      );

      modifiedBond = feeTypeFields(modifiedBond);

      const { facilityValue, coveredPercentage, riskMarginFee } = modifiedBond;
      const sanitizedFacilityValue = sanitizeCurrency(facilityValue);

      modifiedBond.guaranteeFeePayableByBank = calculateGuaranteeFee(riskMarginFee);

      if (sanitizedFacilityValue.sanitizedValue) {
        modifiedBond.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
        modifiedBond.facilityValue = sanitizedFacilityValue.sanitizedValue;
      }

      if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
        modifiedBond = updateRequestedCoverStartDate(modifiedBond);
      } else {
        delete modifiedBond.requestedCoverStartDate;
      }

      const { status, data } = await facilitiesController.update(bondId, modifiedBond, req.user);

      const validationErrors = bondValidationErrors(data, deal);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          bond: data,
        });
      }

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};

exports.deleteBond = async (req, res) => {
  const {
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const { status, data } = await facilitiesController.delete(bondId, req.user);

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};
