const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateLoanInDeal } = require('./loans.controller');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');

exports.updateLoanCoverStartDate = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const existingLoan = deal.loanTransactions.items.find((b) =>
        String(b._id) === loanId); // eslint-disable-line no-underscore-dangle

      if (!existingLoan) {
        return res.status(404).send();
      }

      // TODO (?)
      // only allow the checks/modifications below
      // if all other fields in loan are valid
      if (existingLoan.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL) {
        return res.status(400).send();
      }

      let loan = {
        _id: loanId,
        ...existingLoan,
        ...req.body,
      };

      if (hasAllRequestedCoverStartDateValues(loan)) {
        loan = updateRequestedCoverStartDate(loan);
      }

      const validationErrors = loanIssueFacilityValidationErrors(
        loan,
        deal.details.submissionType,
        deal.details.submissionDate,
        deal.details.manualInclusionNoticeSubmissionDate,
      );

      if (validationErrors.errorList.requestedCoverStartDate) {
        return res.status(400).send({
          validationErrors,
          loan,
        });
      }

      const updatedloan = await updateLoanInDeal(req.params, req.user, deal, loan);
      return res.status(200).send(updatedloan);
    }
    return res.status(404).send();
  });
};
