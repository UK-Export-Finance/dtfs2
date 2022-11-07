const { formatFieldValue } = require('./helpers');

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

  if (filter || filter === false) {
    if (Array.isArray(filter)) {
      // formatFieldValue used to remove whitespaces from value so can match against fieldvalue which has whitespaces removed
      const modifiedFilter = sessionFilters[fieldName].filter((value) => formatFieldValue(value) !== fieldValue);

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
