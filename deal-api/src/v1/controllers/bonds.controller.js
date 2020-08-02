const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const bondValidationErrors = require('../validation/bond');
const { generateFacilityId } = require('../../utils/generateIds');
const { bondStatus } = require('../section-status/bond');
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
const now = require('../../now');

const putBondInDealObject = (deal, bond) => {
  const allOtherBonds = deal.bondTransactions.items.filter((b) =>
    String(b._id) !== bond._id); // eslint-disable-line no-underscore-dangle

  return {
    ...deal,
    bondTransactions: {
      items: [
        ...allOtherBonds,
        bond,
      ],
    },
  };
};

const updateBondInDeal = async (params, user, deal, bond) => {
  const modifiedDeal = putBondInDealObject(deal, bond);

  const newReq = {
    params,
    body: modifiedDeal,
    user,
  };

  const updatedDeal = await updateDeal(newReq);

  const bondInDeal = updatedDeal.bondTransactions.items.find((b) =>
    String(b._id) === bond._id); // eslint-disable-line no-underscore-dangle

  return bondInDeal;
};
exports.updateBondInDeal = updateBondInDeal;

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
      createdDate: now(),
    };

    const modifiedDeal = putBondInDealObject(deal, newBondObj);

    const newReq = {
      params: req.params,
      body: modifiedDeal,
      user: req.user,
    };

    const updateDealResponse = await updateDeal(newReq);

    return res.status(200).send({
      ...updateDealResponse,
      bondId: newBondObj._id, // eslint-disable-line no-underscore-dangle
    });
  });
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
    delete modifiedBond['requestedCoverStartDate'];
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

      const existingBond = deal.bondTransactions.items.find((bond) =>
        String(bond._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!existingBond) {
        return res.status(404).send();
      }

      let modifiedBond = {
        _id: bondId,
        ...existingBond,
        ...req.body,
      };

      modifiedBond = bondStageFields(modifiedBond);

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

      modifiedBond.lastEdited = now();

      const updatedBond = await updateBondInDeal(req.params, req.user, deal, modifiedBond);

      const validationErrors = bondValidationErrors(updatedBond);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          bond: updatedBond,
        });
      }

      return res.status(200).send(updatedBond);
    }
    return res.status(404).send();
  });
};
