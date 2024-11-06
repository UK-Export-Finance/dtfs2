const { getUnixTime } = require('date-fns');
const { ACTIVITY_TYPES } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { generateValidationErrors } = require('../../../helpers/validation');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');
const { mapActivities } = require('./helpers/map-activities');
const { getDealSuccessBannerMessage } = require('../../helpers/get-success-banner-message.helper');

const { DEAL } = CONSTANTS;

const MAX_COMMENT_LENGTH = 1000;

const getActivity = async (req, res) => {
  const dealId = req.params._id;

  const { user, userToken } = req.session;

  // default to all activity
  const activityFilters = {
    filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
  };
  const blankObj = {};

  const deal = await api.getDeal(dealId, userToken, blankObj, activityFilters);
  const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const hasAmendmentInProgress = hasAmendmentInProgressDealStage(amendments);
  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }
  const amendmentsInProgress = amendmentsInProgressByDeal(amendments);

  const activities = mapActivities(deal.tfm.activities);

  const { dealSnapshot } = deal;

  const successMessage = await getDealSuccessBannerMessage({
    dealSnapshot,
    userToken,
    flash: req.flash,
  });

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    successMessage,
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId,
    user,
    selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
    activities,
    hasAmendmentInProgress,
    amendmentsInProgress,
  });
};

const filterActivities = async (req, res) => {
  const dealId = req.params._id;

  const { filterType } = req.body;

  const { user, userToken } = req.session;

  const activityFilters = {
    filterType,
  };
  const blankObj = {};
  const deal = await api.getDeal(dealId, userToken, blankObj, activityFilters);
  const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const hasAmendmentInProgress = hasAmendmentInProgressDealStage(amendments);
  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }
  const amendmentsInProgress = amendmentsInProgressByDeal(amendments);

  const activities = mapActivities(deal.tfm.activities);

  const { dealSnapshot } = deal;

  const successMessage = await getDealSuccessBannerMessage({
    dealSnapshot,
    userToken,
    flash: req.flash,
  });

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    successMessage,
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId,
    user,
    selectedActivityFilter: filterType,
    activities,
    hasAmendmentInProgress,
    amendmentsInProgress,
  });
};

const getCommentBox = async (req, res) => {
  const dealId = req.params._id;
  const { user, userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/activity/activity-comment.njk', {
    dealId,
    user,
    maxCommentLength: MAX_COMMENT_LENGTH,
  });
};

const postComment = async (req, res) => {
  const { params, session, body } = req;
  const dealId = params._id;
  const { user, userToken } = session;
  const { comment } = body;

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errorsCount = 0;
      let validationErrors = {};

      validationErrors = generateValidationErrors('comment', `Comments must be ${MAX_COMMENT_LENGTH} characters or fewer`, errorsCount, validationErrors);

      return res.render('case/activity/activity-comment.njk', {
        dealId,
        user,
        maxCommentLength: MAX_COMMENT_LENGTH,
        validationErrors,
        comment,
      });
    }
    if (comment.length > 0) {
      const shortUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      };
      const commentObj = {
        type: ACTIVITY_TYPES.COMMENT,
        timestamp: getUnixTime(new Date()),
        author: shortUser,
        text: comment,
        label: CONSTANTS.ACTIVITIES.ACTIVITY_LABEL.COMMENT,
      };
      await api.createActivity(dealId, commentObj, userToken);
    }
  } catch (error) {
    console.error('Post comment error %o', error);
  }

  return res.redirect(`/case/${dealId}/activity`);
};

module.exports = {
  getActivity,
  filterActivities,
  getCommentBox,
  postComment,
};
