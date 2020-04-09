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

const applyStatusFilters = (params, user, filters) => {
  const { filterByStatus } = params;
  const updated = { ...filters };

  if (filterByStatus === 'all') {
    // default
  }

  if (filterByStatus === 'draft') {
    updated['details.status'] = { $eq: 'Draft' };
  }

  if (filterByStatus === 'readyForApproval') {
    updated['details.status'] = { $eq: "Ready for Checker's approval" };
  }

  if (filterByStatus === 'inputRequired') {
    updated['details.status'] = { $eq: "Further Maker's input required" };
  }

  if (filterByStatus === 'abandoned') {
    updated['details.status'] = { $eq: 'Abandoned Deal' };
  }

  if (filterByStatus === 'submitted') {
    updated['details.status'] = { $eq: 'Submitted' };
  }

  if (filterByStatus === 'submissionAcknowledged') {
    updated['details.status'] = { $eq: 'Acknowledged by UKEF' };
  }

  if (filterByStatus === 'approved') {
    updated['details.status'] = { $eq: 'Accepted by UKEF (without conditions)' };
  }

  if (filterByStatus === 'approvedWithConditions') {
    updated['details.status'] = { $eq: 'Accepted by UKEF (with conditions)' };
  }

  if (filterByStatus === 'refused') {
    updated['details.status'] = { $eq: 'Rejected by UKEF' };
  }

  return updated;
};

const buildDashboardFilters = (params, user) => {
  let filters = {};

  if (!params) return filters;

  if (params.filterBySubmissionUser) filters = applyUserFilters(params, user, filters);
  if (params.filterBySubmissionType) filters = applyTypeFilters(params, user, filters);
  if (params.filterByStatus) filters = applyStatusFilters(params, user, filters);

  return filters;
};

export default buildDashboardFilters;
