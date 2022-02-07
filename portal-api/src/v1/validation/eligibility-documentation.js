const CONSTANTS = require('../../constants');

exports.getDocumentationErrors = (submissionType, supportingInformation, uploadErrors = []) => {
  const errorList = {};
  const uploadErrorList = {};

  let order = 0;

  const generateError = (fieldname, fieldText, errorText, isMandatory) => {
    if (!isMandatory) { return {}; }

    if (supportingInformation[fieldname] && supportingInformation[fieldname].length) {
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
    const text = ` ${filenameList.join(', ')} ${fieldUploadErrors[0].message}`;

    order += 1;
    return {
      order,
      text,
      summaryText: `${fieldText} - ${text}`,
    };
  };

  // Manual Inclusion Questionnaire if mandatory
  const exporterQuestionnaireMandatory = submissionType !== CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
  errorList.exporterQuestionnaire = generateError('exporterQuestionnaire', 'Manual Inclusion Questionnaire', 'is required.', exporterQuestionnaireMandatory);
  uploadErrorList.exporterQuestionnaire = generateUploadErrors('exporterQuestionnaire', 'Manual Inclusion Questionnaire');

  uploadErrorList.auditedFinancialStatements = generateUploadErrors('auditedFinancialStatements', 'Financial statements for the past 3 years');
  uploadErrorList.yearToDateManagement = generateUploadErrors('yearToDateManagement', 'Year to date management accounts');
  uploadErrorList.financialForecasts = generateUploadErrors('financialForecasts', 'Financial forecasts for the next 3 years');
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
