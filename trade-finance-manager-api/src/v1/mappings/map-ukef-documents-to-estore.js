const { has } = require('lodash');

/**
 * Map UKEF documents to eStore documents
 *
 * Exporter_questionnaire
 * Audited_financial_statements
 * Year_to_date_management
 * Financial_forecasts
 * Financial_information_commentary
 * Corporate_structure
 */
const estoreFiles = {
  // GEF
  manualInclusion: {
    eStoreName: 'Exporter_questionnaire',
  },
  debtorAndCreditorReports: {
    eStoreName: 'Audited_financial_statements',
  },
  // BSS
  auditedFinancialStatements: {
    eStoreName: 'Audited_financial_statements',
  },
  exporterQuestionnaire: {
    eStoreName: 'Exporter_questionnaire',
  },
  yearToDateManagement: {
    eStoreName: 'Year_to_date_management',
  },
  financialForecasts: {
    eStoreName: 'Financial_forecasts',
  },
  financialInformationCommentary: {
    eStoreName: 'Financial_information_commentary',
  },
  corporateStructure: {
    eStoreName: 'Corporate_structure',
  },
};

/**
 * Produces an array of files mapped per eStore consumption
 * @param {Object} files Object of files uploaded
 * @returns Mapped array of files for eStore API consumption
 */
const mapEstoreFiles = (files) => {
  const documents = [];

  const nonDocuments = ['validationErrors', 'security', 'status', 'securityDetails', 'requiredFields'];
  Object.keys(files).forEach((file) => {
    if (!nonDocuments.includes(file)) {
      Object.values(files[file]).forEach((val) => {
        if (has(estoreFiles, file)) {
          documents.push({
            documentType: estoreFiles[file].eStoreName,
            fileName: val.filename,
            fileLocationPath: val.folder ? val.parentId : `${val.parentId}/${val.documentPath}`,
            parentId: val.parentId,
          });
        }
      });
    }
  });
  return documents;
};

exports.mapEstoreFiles = mapEstoreFiles;
