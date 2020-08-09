const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateBondInDeal } = require('./bonds.controller');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { createTimestampFromSubmittedValues } = require('../facility-dates/timestamp');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');

exports.updateBondIssueFacility = async (req, res) => {
  const {
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const bond = deal.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!bond) {
        return res.status(404).send();
      }

      if (!canIssueFacility(req.user.roles, deal, bond)) {
        return res.status(403).send();
      }

      let modifiedBond = {
        _id: bondId,
        ...bond,
        ...req.body,
      };

      if (!modifiedBond.issueFacilityDetailsStarted
        && !modifiedBond.issueFacilityDetailsSubmitted) {
        // add a flag for status handling...
        modifiedBond.issueFacilityDetailsStarted = true;
      }

      const bondHasUniqueIdentificationNumber = hasValue(bond.uniqueIdentificationNumber);
      if (!bondHasUniqueIdentificationNumber) {
        modifiedBond.uniqueIdentificationNumberRequiredForIssuance = true;
      }

      if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
        modifiedBond = updateRequestedCoverStartDate(modifiedBond);
      } else {
        delete modifiedBond.requestedCoverStartDate;
      }

      if (hasAllIssuedDateValues(modifiedBond)) {
        modifiedBond.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');
      } else {
        delete modifiedBond.issuedDate;
      }

      const validationErrors = bondIssueFacilityValidationErrors(
        modifiedBond,
        deal.details.submissionDate,
      );

      if (validationErrors.count === 0) {
        modifiedBond.issueFacilityDetailsProvided = true;
      } else {
        modifiedBond.issueFacilityDetailsProvided = false;
      }

      const updatedBond = await updateBondInDeal(req.params, req.user, deal, modifiedBond);

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
