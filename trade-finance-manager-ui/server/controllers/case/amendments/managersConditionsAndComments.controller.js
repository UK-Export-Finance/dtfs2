const { format, fromUnixTime, getUnixTime } = require('date-fns');
const sanitizeHtml = require('sanitize-html');
const { TFM_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../../../api');

const { userCanEditManagersDecision, ukefDecisionRejected, validateUkefDecision } = require('../../helpers');
const { UNDERWRITER_MANAGER_DECISIONS_TAGS, UNDERWRITER_MANAGER_DECISIONS } = require('../../../constants/decisions.constant');
const { formattedNumber } = require('../../../helpers/number');
const { amendmentManagersDecisionConditionsValidation } = require('./validation/amendmentUnderwriterManagersDecisionConditions.validate');

const getManagersConditionsAndComments = async (req, res) => {
  try {
    const { amendmentId, facilityId } = req.params;
    const { user, userToken } = req.session;
    const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);

    if (!amendment?.amendmentId) {
      return res.redirect('/not-found');
    }
    const facility = await api.getFacility(facilityId, userToken);

    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;

    if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
      amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
      amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
    }

    if (amendment?.changeFacilityValue && amendment?.value) {
      amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
      amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
    }
    amendment.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;
    amendment.facilityType = facility.facilitySnapshot.type;
    amendment.ukefFacilityId = facility.facilitySnapshot.ukefFacilityId;

    return res.render('case/amendments/amendment-managers-conditions-and-comments.njk', {
      amendment,
      isEditable,
      user,
    });
  } catch (error) {
    console.error("Unable to load the Underwriter's manager - conditions and comments page %o", error);
    return res.redirect('/');
  }
};

const postManagersConditionsAndComments = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { user, userToken } = req.session;
  const { ukefDecisionConditions, ukefDecisionDeclined, ukefDecisionComments } = req.body;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);
  const facility = await api.getFacility(facilityId, userToken);
  const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;

  const { errorsObject, amendmentManagersDecisionConditionsErrors } = amendmentManagersDecisionConditionsValidation(req.body, amendment);

  if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
    amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
    amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
  }

  if (amendment?.changeFacilityValue && amendment?.value) {
    amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
    amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
  }
  amendment.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;
  amendment.facilityType = facility.facilitySnapshot.type;
  amendment.ukefFacilityId = facility.facilitySnapshot.ukefFacilityId;

  if (amendmentManagersDecisionConditionsErrors.length) {
    return res.render('case/amendments/amendment-managers-conditions-and-comments.njk', {
      amendment,
      isEditable,
      user,
      errors: errorsObject.errors,
    });
  }

  try {
    const payload = {
      ukefDecision: {
        conditions: sanitizeHtml(ukefDecisionConditions),
        declined: sanitizeHtml(ukefDecisionDeclined),
        comments: sanitizeHtml(ukefDecisionComments),
      },
    };

    // sets conditions or declined to null if neither decision is approved with conditions or declined
    if (!validateUkefDecision(amendment.ukefDecision, UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS)) {
      payload.ukefDecision.conditions = null;
    }

    if (!validateUkefDecision(amendment.ukefDecision, UNDERWRITER_MANAGER_DECISIONS.DECLINED)) {
      payload.ukefDecision.declined = null;
    }

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
    }
    console.error('Unable to add the underwriter managers decision');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (error) {
    console.error("There was a problem adding the manager's decision %o", error?.response?.data);
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

const getManagersConditionsAndCommentsSummary = async (req, res) => {
  try {
    const { amendmentId, facilityId } = req.params;
    const { user, userToken } = req.session;
    const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);

    if (!amendment?.amendmentId) {
      return res.redirect('/not-found');
    }
    const facility = await api.getFacility(facilityId, userToken);

    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === TFM_AMENDMENT_STATUS.IN_PROGRESS;

    if (amendment?.changeCoverEndDate && amendment?.coverEndDate) {
      amendment.currentCoverEndDate = format(fromUnixTime(amendment.currentCoverEndDate), 'dd MMMM yyyy');
      amendment.coverEndDate = format(fromUnixTime(amendment.coverEndDate), 'dd MMMM yyyy');
    }

    if (amendment?.changeFacilityValue && amendment?.value) {
      amendment.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
      amendment.currentValue = amendment?.currentValue ? `${amendment.currency} ${formattedNumber(amendment.currentValue)}` : null;
    }
    amendment.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;
    amendment.facilityType = facility.facilitySnapshot.type;
    amendment.ukefFacilityId = facility.facilitySnapshot.ukefFacilityId;
    amendment.summary = { isEditable: true };

    return res.render('case/amendments/amendment-managers-conditions-and-comments-summary.njk', {
      amendment,
      isEditable,
      user,
    });
  } catch (error) {
    console.error("Unable to load the Underwriter's manager - conditions and comments summary page %o", error);
    return res.redirect('/');
  }
};

const postManagersConditionsAndCommentsSummary = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { userToken } = req.session;

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId, userToken);

  try {
    const payload = {
      ukefDecision: {
        submitted: true,
        submittedAt: getUnixTime(new Date()),
        submittedBy: {
          _id: req?.session?.user?._id,
          username: req?.session?.user?.username,
          name: `${req?.session?.user?.firstName} ${req?.session?.user?.lastName}`,
          email: req?.session?.user?.email,
        },
        managersDecisionEmail: true,
      },
    };

    // sets amendment to complete if declined
    if (ukefDecisionRejected(amendment)) {
      payload.status = TFM_AMENDMENT_STATUS.COMPLETED;
    }

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload, userToken);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/underwriting`);
    }
    console.error('Unable to submit the underwriter managers decision');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
  } catch (error) {
    console.error("There was a problem submitting the manager's decision %o", error?.response?.data);
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
  }
};

module.exports = {
  getManagersConditionsAndComments,
  postManagersConditionsAndComments,
  getManagersConditionsAndCommentsSummary,
  postManagersConditionsAndCommentsSummary,
};
