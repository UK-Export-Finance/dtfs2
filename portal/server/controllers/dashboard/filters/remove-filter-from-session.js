const sanitiseFieldValue = (value) => {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  return value;
};

const removeSessionFilter = (req) => {
  const sessionFilters = req.session.dashboardFilters;
  delete sessionFilters._csrf;

  const {
    fieldName,
    fieldValue,
  } = req.params;

  const filter = sessionFilters[fieldName];

  const sanitisedFieldValue = sanitiseFieldValue(fieldValue);

  if (filter) {
    if (Array.isArray(filter)) {
      const modifiedFilter = sessionFilters[fieldName].filter((value) =>
        value !== sanitisedFieldValue);

      if (!modifiedFilter.length) {
        delete req.session.dashboardFilters[fieldName];
      } else {
        req.session.dashboardFilters[fieldName] = modifiedFilter;
      }
    } else {
      delete req.session.dashboardFilters[fieldName];
    }
  }

  return req.session.dashboardFilters;
};

module.exports = {
  sanitiseFieldValue,
  removeSessionFilter,
};
