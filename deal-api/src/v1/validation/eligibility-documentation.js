
exports.getDocumentationErrors = (criteria = [], dealFiles) => {
  const errorList = {};
  let order = 0;

  const generateError = (fieldname, text, isMandatory) => {
    console.log({ isMandatory });
    if (!isMandatory) { return {}; }

    if (dealFiles[fieldname] && dealFiles[fieldname].length) {
      return {};
    }

    order += 1;
    return {
      order,
      text,
    };
  };

  // Manual Inclusion Questionnaire if mandatory
  errorList.exporterQuestionnaire = generateError('exporterQuestionnaire', 'Manual Inclusion Questionnaire is required.', true);

  // When the user’s answer to EC 12 or 13 is false,
  // user must upload the Manual Inclusion Questionnaire and all the  financial supporting documentation
  const financialMandatory = Boolean(criteria.find((c) => [12, 13].includes(c.id) && !c.answer));

  errorList.auditedFinancialStatements = generateError('auditedFinancialStatements', 'Financial statements for the past 3 years are required', financialMandatory);
  errorList.yearToDateManagement = generateError('yearToDateManagement', 'Year to date management accounts are required.', financialMandatory);
  errorList.financialForecasts = generateError('financialForecasts', 'Financial forecasts for the next 3 years are required.', financialMandatory);
  errorList.financialInformationCommentary = generateError('financialInformationCommentary', 'Brief commentary on the financial information', financialMandatory);

  return {
    count: Object.values(errorList).filter((e) => e.text).length,
    errorList,
  };
};
