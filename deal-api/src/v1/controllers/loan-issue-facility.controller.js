const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateLoanInDeal } = require('./loans.controller');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const { createTimestampFromSubmittedValues } = require('../facility-dates/timestamp');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');

exports.updateLoanIssueFacility = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((l) =>
        String(l._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!loan) {
        return res.status(404).send();
      }

      if (!canIssueFacility(req.user.roles, deal, loan)) {
        return res.status(403).send();
      }

      let modifiedLoan = {
        _id: loanId,
        ...loan,
        ...req.body,
        issueFacilityDetailsStarted: true,
      };

      if (!modifiedLoan.issueFacilityDetailsStarted
          && !modifiedLoan.issueFacilityDetailsSubmitted) {
        // add a flag for status handling...
        modifiedLoan.issueFacilityDetailsStarted = true;
      }

      const loanHasBankReferenceNumber = hasValue(loan.bankReferenceNumber);
      if (!loanHasBankReferenceNumber) {
        modifiedLoan.bankReferenceNumberRequiredForIssuance = true;
      }

      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
      } else {
        delete modifiedLoan.requestedCoverStartDate;
      }

      const validationErrors = loanIssueFacilityValidationErrors(
        modifiedLoan,
        deal.details.submissionDate,
      );

      if (hasAllIssuedDateValues(modifiedLoan)) {
        modifiedLoan.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');
      } else {
        delete modifiedLoan.issuedDate;
      }

      if (validationErrors.count === 0) {
        modifiedLoan.issueFacilityDetailsProvided = true;
      } else {
        modifiedLoan.issueFacilityDetailsProvided = false;
      }

      const updatedLoan = await updateLoanInDeal(req.params, req.user, deal, modifiedLoan);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: updatedLoan,
        });
      }

      return res.status(200).send(updatedLoan);
    }
    return res.status(404).send();
  });
};
