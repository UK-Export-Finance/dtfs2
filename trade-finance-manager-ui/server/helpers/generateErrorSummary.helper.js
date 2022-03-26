const generateErrorSummary = (
  validationErrors,
  hrefGenerator = (id) => id,
) => {
  if (!validationErrors) { return false; }

  // Example validationErrors format
  /*
    {
      "count": 4,
      "errorList": {
          "12": {
              "text": "Eligibility criterion 12 is required",
              "order": "12"
          },
          "13": {
              "text": "Eligibility criterion 13 is required",
              "order": "13"
          },
          "agentAddressLine1": {
              "text": "Agent's corporate address is required",
              "order": "11-3"
          },
          "agentAddressCountry": {},
          "agentName": {},
          "agentAddressPostcode": {
              "text": "Agent's corporate postcode is required",
              "order": "11-4"
          }
      }
    }
  */

  /*
    Need to remove validation errors without a text value
    (as db does a partial update and doesn't remove previous validation errors.
    fixed validation errors are set to {} instead
    and then order the validation errors so their displayed in correct order
  */

  const filteredValidationErrorListArray = Object.entries(validationErrors.errorList)
    .filter(([, value]) => value.text)
    .sort(([, aValue], [, bValue]) => {
      if (Number(aValue.order) < Number(bValue.order)) return -1;
      if (Number(aValue.order) > Number(bValue.order)) return 1;
      return 0;
    });
    // note: [,value] used to prevent 'no unused vars' eslint warning
    // see https://github.com/babel/babel-eslint/issues/274
  const filteredValidationErrorList = Object.fromEntries(filteredValidationErrorListArray);

  const summary = filteredValidationErrorListArray.map(([id, value]) => {
    const {
      text,
      summaryText,
      hrefRoot,
      href,
    } = value;

    // most fields use just a simple field id link.
    // some require an additional `hrefRoot` to link to certain pages that contain the field id link.
    // one edge case (Eligibility Criteria - Check Your Answers), have many different ids/groups, so field.href is used.
    let fieldHref = hrefGenerator(id);

    if (hrefRoot) {
      fieldHref = `${value.hrefRoot}${hrefGenerator(id)}`;
    } else if (href) {
      fieldHref = href;
    }

    return {
      text: summaryText || text,
      href: fieldHref,
    };
  });

  return {
    count: filteredValidationErrorListArray.length,
    errorList: filteredValidationErrorList,
    summary,
  };
};

module.exports = { generateErrorSummary };
