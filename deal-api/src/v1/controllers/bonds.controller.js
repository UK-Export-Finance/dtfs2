const { findOneDeal, updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const bondValidationErrors = require('../validation/bond');
const { generateFacilityId } = require('../../utils/generateIds');
const { bondStatus } = require('../section-status/bond');
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../section-calculations');
const sectionCurrency = require('../section-currency');
const { sanitizeCurrency } = require('../../utils/number');

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

const feeTypeFields = (loan) => {
  const modifiedLoan = loan;
  const { feeType } = modifiedLoan;
  if (feeType === 'At maturity') {
    delete modifiedLoan.feeFrequency;
  }

  return modifiedLoan;
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

      modifiedBond = await sectionCurrency(
        modifiedBond,
        deal,
      );

      modifiedBond = feeTypeFields(modifiedBond);

      const { facilityValue, coveredPercentage, riskMarginFee } = modifiedBond;
      const sanitizedFacilityValue = sanitizeCurrency(facilityValue);

      modifiedBond.guaranteeFeePayableByBank = calculateGuaranteeFee(riskMarginFee);

      modifiedBond.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);

      modifiedBond.facilityValue = sanitizedFacilityValue.sanitizedValue;

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
