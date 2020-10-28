const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateBondInDeal } = require('./bonds.controller');
const facilityChangeCoverStartDateValidationErrors = require('../validation/facility-change-cover-start-date');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');

exports.updateBondCoverStartDate = async (req, res) => {
  const {
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const existingBond = deal.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!existingBond) {
        return res.status(404).send();
      }

      // TODO (?)
      // only allow the checks/modifications below
      // if all other fields in bond are valid
      if (existingBond.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED) {
        return res.status(400).send();
      }

      let bond = {
        _id: bondId,
        ...existingBond,
        ...req.body,
      };

      if (hasAllRequestedCoverStartDateValues(bond)) {
        bond = updateRequestedCoverStartDate(bond);
      }

      const validationErrors = facilityChangeCoverStartDateValidationErrors(
        bond,
        deal,
      );

      if (validationErrors.errorList
        && validationErrors.errorList.requestedCoverStartDate) {
        return res.status(400).send({
          validationErrors,
          bond,
        });
      }

      const updatedBond = await updateBondInDeal(req.params, req.user, deal, bond);
      return res.status(200).send(updatedBond);
    }
    return res.status(404).send();
  });
};
