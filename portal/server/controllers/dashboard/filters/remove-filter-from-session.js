const removeSessionFilter = (req) => {
  const sessionFilters = req.session.dashboardFilters;

  // console.log('---------removeSessionFilter - sessionFilters\n', sessionFilters);
  // console.log('---------removeSessionFilter req.params\n', req.params);

  const {
    fieldName,
    fieldValue,
  } = req.params;

  const filter = sessionFilters[fieldName];

  if (filter) {
    if (Array.isArray(filter)) {
      const modifiedFilter = sessionFilters[fieldName].filter((value) =>
        value !== fieldValue);

      req.session.dashboardFilters[fieldName] = modifiedFilter;
    } else {
      delete req.session.dashboardFilters[fieldName];
    }
  }

  return req.session.dashboardFilters;
};

module.exports = removeSessionFilter;
