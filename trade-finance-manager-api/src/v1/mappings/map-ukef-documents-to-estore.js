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
  exportLicence: {
    eStoreName: 'Financial_information_commentary', // TODO: update to `Business Information` once eStore supports it
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
  console.log('🚀 ~ file: map-ukef-documents-to-estore.js ~ line 34 ~ mapUKEFDocumentsToEstore ~ files', files);

  const nonDocuments = ['validationErrors', 'security', 'status', 'securityDetails'];
  Object.keys(files).forEach((file) => {
    if (!nonDocuments.includes(file)) {
      Object.values(files[file]).forEach((val) => {
        documents.push({
          documentType: eStoreMap[file].eStoreName,
          fileName: val.filename,
          fileLocationPath: val.folder ? `files/${val.folder}` : `files/portal_storage/${val._id}/${val.documentPath}/`,
        });
      });
    }
  });
  return documents;
};

exports.mapUKEFDocumentsToEstore = mapUKEFDocumentsToEstore;
