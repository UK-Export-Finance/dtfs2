const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate } = require('../facility-dates/requested-cover-start-date');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const { getStartOfDateFromDayMonthYearStrings } = require('../helpers/date');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

exports.updateLoanIssueFacility = async (req, res) => {
  const {
    body,
    user,
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

    const loan = await facilitiesController.findOne(loanId);

    if (!loan) {
      return res.status(404).send();
    }

    if (!canIssueFacility(user.roles, deal, loan)) {
      return res.status(403).send();
    }

    let modifiedLoan = {
      ...loan,
      ...body,
    };

    // remove status added via type B XML. (we dynamically generate statuses)
    modifiedLoan.status = null;

    if (!modifiedLoan.issueFacilityDetailsStarted && !modifiedLoan.issueFacilityDetailsSubmitted) {
      // add a flag for UI/design/status/business handling...
      modifiedLoan.issueFacilityDetailsStarted = true;
    }

    const loanHasName = hasValue(loan.name);
    if (!loanHasName) {
      modifiedLoan.nameRequiredForIssuance = true;
    }

    if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
      modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
    } else {
      modifiedLoan.requestedCoverStartDate = null;
    }

    if (hasAllIssuedDateValues(modifiedLoan)) {
      modifiedLoan.issuedDate = getStartOfDateFromDayMonthYearStrings(body['issuedDate-day'], body['issuedDate-month'], body['issuedDate-year'])
        .valueOf()
        .toString();
    } else {
      modifiedLoan.issuedDate = null;
    }

    const validationErrors = loanIssueFacilityValidationErrors(modifiedLoan, deal);

    modifiedLoan.hasBeenIssued = false;
    modifiedLoan.issueFacilityDetailsProvided = false;

    if (validationErrors.count === 0) {
      modifiedLoan.issueFacilityDetailsProvided = true;
      modifiedLoan.hasBeenIssued = true;
      modifiedLoan.previousFacilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL;
      modifiedLoan.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL;
    }

    const { status, data } = await facilitiesController.update(dealId, loanId, modifiedLoan, user, auditDetails);

    if (validationErrors.count !== 0) {
      return res.status(400).send({
        validationErrors,
        loan: data,
      });
    }

    return res.status(status).send(data);
  });
};
