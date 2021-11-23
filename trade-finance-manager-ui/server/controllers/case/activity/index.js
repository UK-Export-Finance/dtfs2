const { getUnixTime, fromUnixTime } = require('date-fns');
const api = require('../../../api');
const { validationErrorHandler } = require('../helpers');
const CONSTANTS = require('../../../constants');

const MAX_COMMENT_LENGTH = 1000;

const mappedActivities = (activities) => activities.map((activity) => ({
  label: {
    text: activity.label,
  },
  text: activity.text,
  datetime: {
    timestamp: fromUnixTime(new Date(activity.timestamp)),
    type: 'datetime',
  },
  byline: {
    text: `${activity.author.firstName} ${activity.author.lastName}`,
  },
}));

const getActivity = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { user } = req.session;

  // default to all activity
  const activityFilters = {
    filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
  };
  const blankObj = {};

  const deal = await api.getDeal(dealId, blankObj, activityFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const activities = mappedActivities(deal.tfm.activities);

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
    activities,
  });
};

const filterActivities = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { filterType } = req.body;

  const { user } = req.session;

  const activityFilters = {
    filterType,
  };
  const blankObj = {};
  const deal = await api.getDeal(dealId, blankObj, activityFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const activities = mappedActivities(deal.tfm.activities);

  return res.render('case/activity/activity.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'activity',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    selectedActivityFilter: filterType,
    activities,
  });
};

const getCommentBox = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  return res.render('case/activity/activity-comment.njk', {
    dealId,
    user,
    maxCommentLength: MAX_COMMENT_LENGTH,
  });
};

const postComment = async (req, res) => {
  const { params, session, body } = req;
  const dealId = params._id; // eslint-disable-line no-underscore-dangle
  const { user } = session;
  const { comment } = body;

  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `Comments must be ${MAX_COMMENT_LENGTH} characters or fewer`,
      });
      return res.render('case/activity/activity-comment.njk', {
        dealId,
        user,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
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
      await api.createActivity(dealId, commentObj);
    }
  } catch (err) {
    console.error('Post comment error ', err);
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
