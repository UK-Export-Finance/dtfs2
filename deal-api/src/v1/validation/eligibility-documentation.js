
const CONSTANTS = require('../../constants');

exports.getDocumentationErrors = (submissionType, criteria = [], dealFiles, uploadErrors = []) => {
  const errorList = {};
  const uploadErrorList = {};

  let order = 0;

  const generateError = (fieldname, fieldText, errorText, isMandatory) => {
    if (!isMandatory) { return {}; }

    if (dealFiles[fieldname] && dealFiles[fieldname].length) {
      return {};
    }
    const text = `${fieldText} ${errorText}`;


    order += 1;
    return {
      order,
      text,
    };
  };

  const generateUploadErrors = (fieldname, fieldText) => {
    const fieldUploadErrors = uploadErrors.filter((err) => err.field === fieldname);

    if (!fieldUploadErrors.length) {
      return false;
    }

    const filenameList = fieldUploadErrors.map((fieldError) => fieldError.originalname);
    const text = `${fieldText} - ${filenameList.join(', ')} ${fieldUploadErrors[0].message}`;

    order += 1;
    return {
      order,
      text,
    };
  };

  // Manual Inclusion Questionnaire if mandatory
  const exporterQuestionnaireMandatory = submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
  errorList.exporterQuestionnaire = generateError('exporterQuestionnaire', 'Manual Inclusion Questionnaire', 'is required.', exporterQuestionnaireMandatory);
  uploadErrorList.exporterQuestionnaire = generateUploadErrors('exporterQuestionnaire', 'Manual Inclusion Questionnaire');

  // When the user’s answer to EC 12 or 13 is false,
  // user must upload the Manual Inclusion Questionnaire and all the  financial supporting documentation
  const financialMandatory = Boolean(criteria.find((c) => [12, 13].includes(c.id) && !c.answer));

  errorList.auditedFinancialStatements = generateError('auditedFinancialStatements', 'Financial statements for the past 3 years', 'are required', financialMandatory);
  uploadErrorList.auditedFinancialStatements = generateUploadErrors('auditedFinancialStatements', 'Financial statements for the past 3 years');

  errorList.yearToDateManagement = generateError('yearToDateManagement', 'Year to date management accounts', 'are required.', financialMandatory);
  uploadErrorList.yearToDateManagement = generateUploadErrors('yearToDateManagement', 'Year to date management accounts');

  errorList.financialForecasts = generateError('financialForecasts', 'Financial forecasts for the next 3 years', 'are required.', financialMandatory);
  uploadErrorList.financialForecasts = generateUploadErrors('financialForecasts', 'Financial forecasts for the next 3 years');

  errorList.financialInformationCommentary = generateError('financialInformationCommentary', 'Brief commentary on the financial information', '', financialMandatory);
  uploadErrorList.financialInformationCommentary = generateUploadErrors('financialInformationCommentary', 'Brief commentary on the financial information');

  uploadErrorList.corporateStructure = generateUploadErrors('corporateStructure', 'Corporate structure diagram');

  return {
    validationErrors: {
      count: Object.values(errorList).filter((e) => e.text).length,
      errorList,
    },
    validationUploadErrors: {
      count: Object.values(uploadErrorList).filter((e) => e.text).length,
      errorList: uploadErrorList,
    },
  };
};
