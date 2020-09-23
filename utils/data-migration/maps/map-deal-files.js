const hasError = false;

const mapDealFiles = (portalDealId, v1Deal) => {
  const v2SingleDealFile = (filename, type) => (
    {
      type,
      fullPath: `portalStorage/${portalDealId}/${filename}`,
      filename,
    }
  );

  const v2DealFile = (value, type) => {
    if (Array.isArray(value)) {
      return value.map((filename) => v2SingleDealFile(filename, type));
    }
    return [v2SingleDealFile(value, type)];
  };

  const { Deal_information: { Exporter_and_indemnifier: exporterInfo } } = v1Deal;

  const {
    Deal_files: {
      Exporter_questionnaire: v1ExporterQuestionnaire,
      Audited_financial_statements: v1AuditedFinancialStatements,
      Year_to_date_management: v1YearToDateManagement,
      Financial_forecasts: v1FinancialForecasts,
      Financial_information_commentary: v1FinancialInformationCommentary,
      Corporate_structure: v1CorporateStructure,
    },
  } = v1Deal;

  const dealFiles = {
    security: exporterInfo.Bank_security,
  };

  if (v1ExporterQuestionnaire) {
    dealFiles.exporterQuestionnaire = v2DealFile(v1ExporterQuestionnaire, 'general_correspondence');
  }

  if (v1AuditedFinancialStatements) {
    dealFiles.auditedFinancialStatements = v2DealFile(v1AuditedFinancialStatements, 'financials');
  }

  if (v1YearToDateManagement) {
    dealFiles.yearToDateManagement = v2DealFile(v1YearToDateManagement, 'financials');
  }

  if (v1FinancialForecasts) {
    dealFiles.financialForecasts = v2DealFile(v1FinancialForecasts, 'financials');
  }

  if (v1FinancialInformationCommentary) {
    dealFiles.financialInformationCommentary = v2DealFile(v1FinancialInformationCommentary, 'financials');
  }

  if (v1CorporateStructure) {
    dealFiles.corporateStructure = v2DealFile(v1CorporateStructure, 'general_correspondence');
  }

  return [
    dealFiles,
    hasError,
  ];
};

module.exports = mapDealFiles;
