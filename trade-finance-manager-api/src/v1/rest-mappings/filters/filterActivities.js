const { ACTIVITY_TYPES } = require('@ukef/dtfs2-common');

const FILTER_TYPE = {
  ALL: 'all-activity',
  COMMENT: 'comments-only',
};

const filter = (activities, activityType) => activities.filter((activity) => activity.type === activityType);

const filterByComment = (activities) => filter(activities, ACTIVITY_TYPES.COMMENT);

const filterActivities = (activities, filtersObj) => {
  if (!filtersObj?.filterType || filtersObj?.filterType === FILTER_TYPE.ALL) {
    return activities;
  }

  const { filterType } = filtersObj;

  if (filterType === FILTER_TYPE.COMMENT) {
    return filterByComment(activities);
  }

  return activities;
};

module.exports = {
  filter,
  filterByComment,
  filterActivities,
};
