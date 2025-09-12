const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate } = require('../facility-dates/requested-cover-start-date');
const { getStartOfDateFromDayMonthYearStrings } = require('../helpers/date');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

exports.updateBondIssueFacility = async (req, res) => {
  const {
    body,
    user,
    params: { id: dealId, bondId },
  } = req;
  const auditDetails = generatePortalAuditDetails(user._id);

  await findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(user, deal)) {
      return res.status(401).send();
    }

    const bond = await facilitiesController.findOne(bondId);

    if (!bond) {
      return res.status(404).send();
    }

    if (!canIssueFacility(user.roles, deal, bond)) {
      return res.status(403).send();
    }

    let modifiedBond = {
      ...bond,
      ...body,
    };

    // remove status added via type B XML. (we dynamically generate statuses)
    modifiedBond.status = null;

    if (!modifiedBond.issueFacilityDetailsStarted && !modifiedBond.issueFacilityDetailsSubmitted) {
      // add a flag for UI/design/status/business handling...
      modifiedBond.issueFacilityDetailsStarted = true;
    }

    const bondHasName = hasValue(bond.name);
    if (!bondHasName) {
      modifiedBond.nameRequiredForIssuance = true;
    }

    if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
      modifiedBond = updateRequestedCoverStartDate(modifiedBond);
    } else {
      modifiedBond.requestedCoverStartDate = null;
    }

    if (hasAllIssuedDateValues(modifiedBond)) {
      modifiedBond.issuedDate = getStartOfDateFromDayMonthYearStrings(body['issuedDate-day'], body['issuedDate-month'], body['issuedDate-year'])
        .valueOf()
        .toString();
    } else {
      modifiedBond.issuedDate = null;
    }

    const validationErrors = bondIssueFacilityValidationErrors(modifiedBond, deal);

    modifiedBond.hasBeenIssued = false;
    modifiedBond.issueFacilityDetailsProvided = false;

    if (validationErrors.count === 0) {
      modifiedBond.issueFacilityDetailsProvided = true;
      modifiedBond.hasBeenIssued = true;
      modifiedBond.previousFacilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED;
      modifiedBond.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED;
    }

    const { status, data } = await facilitiesController.update(dealId, bondId, modifiedBond, user, auditDetails);

    if (validationErrors.count !== 0) {
      return res.status(400).send({
        validationErrors,
        bond: data,
      });
    }

    return res.status(status).send(data);
  });
};
