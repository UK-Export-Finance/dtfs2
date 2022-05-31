const { format, fromUnixTime, getUnixTime } = require('date-fns');
const api = require('../../../api');

const { userCanEditManagersDecision } = require('../../helpers');
const { AMENDMENT_STATUS } = require('../../../constants/amendments');
const { UNDERWRITER_MANAGER_DECISIONS_TAGS } = require('../../../constants/decisions.constant');
const { formattedNumber } = require('../../../helpers/number');

const getManagersConditionsAndComments = async (req, res) => {
  try {
    const { amendmentId, facilityId } = req.params;
    const { user } = req.session;
    const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

    if (!amendment?.amendmentId) {
      return res.redirect('/not-found');
    }
    const facility = await api.getFacility(facilityId);

    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

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
    console.error("Unable to load the Underwriter's manager - conditions and comments page %O", { response: error });
    return res.redirect('/');
  }
};

const postManagersConditionsAndComments = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { ukefDecisionConditions, ukefDecisionDeclined, ukefDecisionComments } = req.body;

  try {
    const payload = {
      ukefDecision: {
        conditions: ukefDecisionConditions,
        declined: ukefDecisionDeclined,
        comments: ukefDecisionComments,
      },
    };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
    }
    console.error('Unable to add the underwriter managers decision');
    return res.redirect(`/case/${dealId}/underwriting`);
  } catch (err) {
    console.error("There was a problem adding the manager's decision %O", { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/underwriting`);
  }
};

const getManagersConditionsAndCommentsSummary = async (req, res) => {
  try {
    const { amendmentId, facilityId } = req.params;
    const { user } = req.session;
    const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

    if (!amendment?.amendmentId) {
      return res.redirect('/not-found');
    }
    const facility = await api.getFacility(facilityId);

    const isEditable = userCanEditManagersDecision(amendment, user) && amendment.status === AMENDMENT_STATUS.IN_PROGRESS;

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
    console.error("Unable to load the Underwriter's manager - conditions and comments summary page %O", { response: error });
    return res.redirect('/');
  }
};

const postManagersConditionsAndCommentsSummary = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;

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
      },
    };

    const { status } = await api.updateAmendment(facilityId, amendmentId, payload);

    if (status === 200) {
      return res.redirect(`/case/${dealId}/underwriting`);
    }
    console.error('Unable to submit the underwriter managers decision');
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
  } catch (err) {
    console.error("There was a problem submitting the manager's decision %O", { response: err?.response?.data });
    return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/managers-conditions/summary`);
  }
};

module.exports = {
  getManagersConditionsAndComments,
  postManagersConditionsAndComments,
  getManagersConditionsAndCommentsSummary,
  postManagersConditionsAndCommentsSummary,
};
