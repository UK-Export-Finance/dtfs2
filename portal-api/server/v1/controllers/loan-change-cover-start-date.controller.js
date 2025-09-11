const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const facilityChangeCoverStartDateValidationErrors = require('../validation/facility-change-cover-start-date');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate } = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');
const facilitiesController = require('./facilities.controller');

exports.updateLoanCoverStartDate = async (req, res) => {
  const {
    user,
    body,
    params: { id: dealId, loanId },
  } = req;
  const auditDetails = generatePortalAuditDetails(user._id);

  await findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }
    if (!userHasAccessTo(user, deal)) {
      return res.status(401).send();
    }

    const existingLoan = await facilitiesController.findOne(loanId);

    if (!existingLoan) {
      return res.status(404).send();
    }

    if (existingLoan.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) {
      return res.status(400).send();
    }

    let modifiedLoan = {
      ...existingLoan,
      ...body,
    };

    if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
      modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
    }

    const validationErrors = facilityChangeCoverStartDateValidationErrors(modifiedLoan, deal);

    if (validationErrors.errorList && validationErrors.errorList.requestedCoverStartDate) {
      return res.status(400).send({
        validationErrors,
        loan: modifiedLoan,
      });
    }

    const { status, data } = await facilitiesController.update(dealId, loanId, modifiedLoan, user, auditDetails);

    return res.status(status).send(data);
  });
};
