const FILTER_TYPE = {
  ALL: 'all-activity',
  COMMENT: 'comments-only',
};

const filter = (activities, FILTER_VALUE) => activities.filter((activity) => activity.type === FILTER_VALUE);

const filterByComment = (activities) => filter(activities, 'COMMENT');

/**
 * filters activities
 */
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
