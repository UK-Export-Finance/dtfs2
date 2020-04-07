const applyUserFilters = (params, user, filters) => {
  const { filterBySubmissionUser } = params;
  const updated = { ...filters };

  if (filterBySubmissionUser === 'all') {
    // default
  }

  if (filterBySubmissionUser === 'createdByMe') {
    updated['details.maker.username'] = { $eq: user.username };
  }

  if (filterBySubmissionUser === 'createdByColleagues') {
    updated['details.maker.username'] = { $ne: user.username };
  }

  return updated;
};

const applyTypeFilters = (params, user, filters) => {
  const { filterBySubmissionType } = params;
  const updated = { ...filters };

  if (filterBySubmissionType === 'all') {
    // default
  }

  if (filterBySubmissionType === 'manualInclusionApplication') {
    updated['details.submissionType'] = { $eq: 'Manual Inclusion Application' };
  }

  if (filterBySubmissionType === 'automaticInclusionNotice') {
    updated['details.submissionType'] = { $eq: 'Automatic Inclusion Notice' };
  }

  if (filterBySubmissionType === 'manualInclusionNotice') {
    updated['details.submissionType'] = { $eq: 'Manual Inclusion Notice' };
  }

  return updated;
};

const buildDashboardFilters = (params, user) => {
  let filters = {};

  if (!params) return filters;

  if (params.filterBySubmissionUser) filters = applyUserFilters(params, user, filters);
  if (params.filterBySubmissionType) filters = applyTypeFilters(params, user, filters);

  //

  return filters;
};

export default buildDashboardFilters;
