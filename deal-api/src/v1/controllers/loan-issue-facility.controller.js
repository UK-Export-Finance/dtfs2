const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateLoanInDeal } = require('./loans.controller');
const {
  formattedTimestamp,
  createTimestampFromSubmittedValues,
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../section-dates/requested-cover-start-date');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');

exports.updateLoanIssueFacility = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const loan = deal.loanTransactions.items.find((l) =>
        String(l._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!loan) {
        return res.status(404).send();
      }

      let modifiedLoan = {
        _id: loanId,
        ...loan,
        ...req.body,
      };

      modifiedLoan.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');

      let formattedRequestedCoverStartDate;
      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
        // formatted moment date for date comparison validation
        formattedRequestedCoverStartDate = formattedTimestamp(modifiedLoan.requestedCoverStartDate, req.user.timezone);
      }

      const validationErrors = loanIssueFacilityValidationErrors(
        modifiedLoan,
        // formatted moment dates for date comparison validation
        formattedTimestamp(deal.details.submissionDate, req.user.timezone),
        formattedTimestamp(modifiedLoan.issuedDate, req.user.timezone),
        formattedRequestedCoverStartDate,
      );

      if (validationErrors.count === 0) {
        modifiedLoan.facilityIssued = true;
        delete modifiedLoan['requestedCoverStartDate-day'];
        delete modifiedLoan['requestedCoverStartDate-month'];
        delete modifiedLoan['requestedCoverStartDate-year'];
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
