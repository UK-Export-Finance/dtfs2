const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const facilityChangeCoverStartDateValidationErrors = require('../validation/facility-change-cover-start-date');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');
const facilitiesController = require('./facilities.controller');

exports.updateLoanCoverStartDate = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const existingLoan = await facilitiesController.findOne(loanId);

      if (!existingLoan) {
        return res.status(404).send();
      }

      // TODO (?)
      // only allow the checks/modifications below
      // if all other fields in loan are valid
      if (existingLoan.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) {
        return res.status(400).send();
      }

      let modifiedLoan = {
        ...existingLoan,
        ...req.body,
      };

      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
      }

      const validationErrors = facilityChangeCoverStartDateValidationErrors(
        modifiedLoan,
        deal,
      );

      if (validationErrors.errorList
        && validationErrors.errorList.requestedCoverStartDate) {
        return res.status(400).send({
          validationErrors,
          loan: modifiedLoan,
        });
      }

      const { status, data } = await facilitiesController.update(loanId, modifiedLoan, req.user);

      return res.status(status).send(data);
    }
    return res.status(404).send();
  });
};
