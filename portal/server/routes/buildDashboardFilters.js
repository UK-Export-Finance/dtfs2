const buildDashboardFilters = (params, user) => {
  const filters = {};
  const { filterBySubmissionUser } = params;

  if (filterBySubmissionUser === 'all') {
    // default
  }
  if (filterBySubmissionUser === 'createdByMe') {
    filters['details.maker.username'] = { $eq: user.username };
  }

  if (filterBySubmissionUser === 'createdByColleagues') {
    filters['details.maker.username'] = { $ne: user.username };
  }

  return filters;
};

export default buildDashboardFilters;
