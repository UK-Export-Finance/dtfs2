const fileshare = require('../helpers/fileshare');
const log = require('../helpers/log');

require('dotenv').config();


const AZURE_PORTAL_FILESHARE_CONFIG = {
  FILESHARE_NAME: process.env.MIGRATION_AZURE_PORTAL_FILESHARE_NAME,
  EXPORT_FOLDER: process.env.MIGRATION_AZURE_PORTAL_EXPORT_FOLDER,
  STORAGE_ACCOUNT: process.env.MIGRATION_AZURE_PORTAL_STORAGE_ACCOUNT,
  STORAGE_ACCESS_KEY: process.env.MIGRATION_AZURE_PORTAL_STORAGE_ACCESS_KEY,
};

const mapDealFiles = async (portalDealId, v1Deal) => {
  const hasError = false;

  const logError = (error) => {
    // Allow deals to be migrated if deal file is missing for now.
    // hasError = true;
    log.addError(portalDealId, error);
  };

  const copyDealFile = async (dealFiles) => {
    const AZURE_WORKFLOW_FILESHARE_CONFIG = fileshare.getConfig();

    for (let i = 0; i < dealFiles.length; i += 1) {
      const from = {
        fileshare: AZURE_WORKFLOW_FILESHARE_CONFIG.FILESHARE_NAME,
        folder: `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}/${portalDealId}`,
        filename: dealFiles[i].filename,
      };

      // eslint-disable-next-line no-await-in-loop
      const fileBuffer = await fileshare.readFile(from).catch((err) => console.log({ err }));

      if (fileBuffer.error) {
        logError(`File not found: ${from.folder}/${from.filename}`);
      } else {
        const to = {
          fileshare: AZURE_PORTAL_FILESHARE_CONFIG.FILESHARE_NAME,
          folder: `${AZURE_PORTAL_FILESHARE_CONFIG.EXPORT_FOLDER}/${portalDealId}`,
          filename: from.filename,
          buffer: fileBuffer,
        };

        // Set fileshare to portal fileshare
        fileshare.setConfig(AZURE_PORTAL_FILESHARE_CONFIG);
        // eslint-disable-next-line no-await-in-loop
        const uploadFile = await fileshare.uploadFile(to);

        if (uploadFile.error) {
          logError(`Error uploading file: ${to.folder}/${to.filename}: ${uploadFile.error.message}`);
        }
      }

      // Reset config to workflow
      fileshare.setConfig(AZURE_WORKFLOW_FILESHARE_CONFIG);
    }
  };

  const v2SingleDealFile = (filename, type) => (
    {
      type,
      fullPath: `portalStorage/${portalDealId}/${filename}`,
      filename,
    }
  );

  const v2DealFile = async (value, type) => {
    const v2DealFiles = Array.isArray(value)
      ? value.map((filename) => v2SingleDealFile(filename, type))
      : [v2SingleDealFile(value, type)];

    const copyFiles = await copyDealFile(v2DealFiles);

    return v2DealFiles;
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
    dealFiles.exporterQuestionnaire = await v2DealFile(v1ExporterQuestionnaire, 'general_correspondence');
  }

  if (v1AuditedFinancialStatements) {
    dealFiles.auditedFinancialStatements = await v2DealFile(v1AuditedFinancialStatements, 'financials');
  }

  if (v1YearToDateManagement) {
    dealFiles.yearToDateManagement = await v2DealFile(v1YearToDateManagement, 'financials');
  }

  if (v1FinancialForecasts) {
    dealFiles.financialForecasts = await v2DealFile(v1FinancialForecasts, 'financials');
  }

  if (v1FinancialInformationCommentary) {
    dealFiles.financialInformationCommentary = await v2DealFile(v1FinancialInformationCommentary, 'financials');
  }

  if (v1CorporateStructure) {
    dealFiles.corporateStructure = await v2DealFile(v1CorporateStructure, 'general_correspondence');
  }

  return [
    dealFiles,
    hasError,
  ];
};

module.exports = mapDealFiles;
