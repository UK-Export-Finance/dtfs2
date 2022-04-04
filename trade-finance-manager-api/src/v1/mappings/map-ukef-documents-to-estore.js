// eStore mapping
// Exporter_questionnaire
// Audited_financial_statements
// Year_to_date_management
// Financial_forecasts
// Financial_information_commentary
// Corporate_structure

const eStoreMap = {
  // GEF
  manualInclusion: {
    eStoreName: 'Exporter_questionnaire',
  },
  debtorAndCreditorReports: {
    eStoreName: 'Audited_financial_statements', // TODO: update to `Business Information` once eStore supports it
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

const mapUKEFDocumentsToEstore = (files) => {
  const documents = [];

  const nonDocuments = ['validationErrors', 'security', 'status', 'securityDetails', 'requiredFields'];
  Object.keys(files).forEach((file) => {
    if (!nonDocuments.includes(file)) {
      Object.values(files[file]).forEach((val) => {
        if (eStoreMap[file]?.eStoreName) {
          documents.push({
            documentType: eStoreMap[file].eStoreName,
            fileName: val.filename,
            fileLocationPath: val.folder ? `files/${val.folder}` : `files/portal_storage/${val.parentId}/${val.documentPath}/`,
            parentId: val.parentId,
          });
        }
      });
    }
  });
  return documents;
};

exports.mapUKEFDocumentsToEstore = mapUKEFDocumentsToEstore;
