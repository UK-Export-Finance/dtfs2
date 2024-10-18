const { getUnixTime, fromUnixTime } = require('date-fns');
const api = require('../../../api');
const { generateValidationErrors } = require('../../../helpers/validation');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');

const { DEAL } = CONSTANTS;

const MAX_COMMENT_LENGTH = 1000;

const mappedActivities = (activities) => {
  if (!activities) {
    return false;
  }

  return activities.map((activity) => {
    switch (activity.type) {
      case 'CANCELLATION':
        return {
          label: {
            text: activity.label,
          },
          html: `
          <p> Deal stage:
            <strong class="govuk-tag govuk-tag--red">
              Cancelled
            </strong> <br/>
            Bank request date: ${activity.bankRequestDate}<br/>
            Date effective from: ${activity.effectiveFrom}<br/>
            Comments: ${activity.reason || '-'}
          </p>`,
          datetime: {
            timestamp: fromUnixTime(activity.timestamp),
            type: 'datetime',
          },
          byline: {
            text: `${activity.author.firstName} ${activity.author.lastName}`,
          },
        };
      default:
        return {
          label: {
            text: activity.label,
          },
          text: activity.text,
          datetime: {
            timestamp: fromUnixTime(activity.timestamp),
            type: 'datetime',
          },
          byline: {
            text: `${activity.author.firstName} ${activity.author.lastName}`,
          },
        };
    }
  });
};

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

  const activities = mappedActivities(deal.tfm.activities);

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
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

  const activities = mappedActivities(deal.tfm.activities);

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
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
        type: 'COMMENT',
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
  mappedActivities,
  getActivity,
  filterActivities,
  getCommentBox,
  postComment,
};
