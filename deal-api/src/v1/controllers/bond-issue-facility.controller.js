const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateBondInDeal } = require('./bonds.controller');
const {
  createTimestampFromSubmittedValues,
//   hasAllRequestedCoverStartDateValues,
//   updateRequestedCoverStartDate,
} = require('../section-dates/requested-cover-start-date');
const { hasValue } = require('../../utils/string');

const hasAllIssuedDateValues = (bond) => {
  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = bond;

  const hasIssuedDate = (hasValue(issuedDateDay)
    && hasValue(issuedDateMonth)
    && hasValue(issuedDateYear));

  if (hasIssuedDate) {
    return true;
  }

  return false;
};

exports.updateBondIssueFacility = async (req, res) => {
  const {
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const bond = deal.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!bond) {
        return res.status(404).send();
      }

      const modifiedBond = {
        _id: bondId,
        ...bond,
        ...req.body,
      };

      // if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
      //   modifiedBond = updateRequestedCoverStartDate(modifiedBond);
      // } else {
      //   delete modifiedBond.requestedCoverStartDate;
      // }

      // const validationErrors = bondIssueFacilityValidationErrors(
      //   modifiedBond,
      //   deal.details.submissionDate,
      // );
      const validationErrors = {
        count: 1,
      };

      if (hasAllIssuedDateValues(modifiedBond)) {
        modifiedBond.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');
      } else {
        delete modifiedBond.issuedDate;
      }

      // if (validationErrors.count === 0) {
      //   modifiedBond.issueFacilityDetailsProvided = true;
      // }

      const updatedBond = await updateBondInDeal(req.params, req.user, deal, modifiedBond);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          // validationErrors,
          bond: updatedBond,
        });
      }

      return res.status(200).send(updatedBond);
    }
    return res.status(404).send();
  });
};
