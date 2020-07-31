const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateLoanInDeal } = require('./loans.controller');
const {
  createTimestampFromSubmittedValues,
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../section-dates/requested-cover-start-date');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');

const hasAllIssuedDateValues = (loan) => {
  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = loan;

  const hasIssuedDate = (hasValue(issuedDateDay)
                        && hasValue(issuedDateMonth)
                        && hasValue(issuedDateYear));

  if (hasIssuedDate) {
    return true;
  }

  return false;
};

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
