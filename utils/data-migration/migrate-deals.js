const fs = require('fs');
const xml2js = require('xml2js');
const fileshare = require('./helpers/fileshare');
require('dotenv').config();
const {
  mapDealRoot,
  mapDetails,
  mapEligibility,
  mapSubmissionDetails,
  mapDealFiles,
  mapBondTransactions,
  mapLoanTransactions,
  mapComments,
  mapMandatoryCriteria,
  mapExporter,
} = require('./maps');
const { initBanks } = require('./helpers/banks');
const { initUsers } = require('./helpers/users');
const { initCountries } = require('./helpers/countries');
const { initCurrencies } = require('./helpers/currencies');
const { initIndustrySectors } = require('./helpers/industry-sectors');
const { convertV1Date } = require('./helpers/date-helpers');
const consoleLogColor = require('./helpers/console-log-colour');

const log = require('./helpers/log');
const { getToken, removeMigrationUser } = require('./temporary-token-handler');
const api = require('./api');

const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

let token;
let logFile;
let importDealCount;

const AZURE_WORKFLOW_FILESHARE_CONFIG = {
  FILESHARE_NAME: process.env.MIGRATION_AZURE_WORKFLOW_FILESHARE_NAME,
  MIGRATION_FOLDER: process.env.MIGRATION_AZURE_WORKFLOW_MIGRATION_FOLDER,
  STORAGE_ACCOUNT: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCOUNT,
  STORAGE_ACCESS_KEY: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCESS_KEY,
};

const init = async () => {
  token = await getToken();
  await initBanks(token);
  await initUsers(token);
  await initCountries(token);
  await initCurrencies(token);
  await initIndustrySectors(token);
  fileshare.setConfig(AZURE_WORKFLOW_FILESHARE_CONFIG);
  logFile = log.init('migrate-deals');
};

const teardown = async () => {
  await removeMigrationUser();
  const successCount = log.getSuccessCount();
  consoleLogColor(`Migrated ${successCount} of ${importDealCount}`, successCount === importDealCount ? 'green' : 'red');
  console.info(`Log file: ${logFile}`);
};

const convertHtmlEntities = (value) => entities.decode(value);

const mapV2 = async (portalDealId, v1Deal) => {
  const [dealRoot, dealRootError] = mapDealRoot(portalDealId, v1Deal);
  const [details, detailsError] = mapDetails(portalDealId, v1Deal, dealRoot.submissionType);
  const [eligibility, eligibilityError] = mapEligibility(portalDealId, v1Deal);
  const [submissionDetails, submissionDetailsError] = mapSubmissionDetails(portalDealId, v1Deal);
  const [dealFiles, dealFilesError] = await mapDealFiles(portalDealId, v1Deal);
  const [bondTransactions, bondTransactionsError] = mapBondTransactions(portalDealId, v1Deal);
  const [loanTransactions, loanTransactionsError] = mapLoanTransactions(portalDealId, v1Deal);
  const comments = mapComments(v1Deal);
  const mandatoryCriteria = mapMandatoryCriteria(v1Deal);
  const exporter = mapExporter(v1Deal);

  if (
    dealRootError
    || detailsError
    || eligibilityError
    || submissionDetailsError
    || dealFilesError
    || bondTransactionsError
    || loanTransactionsError
  ) {
    console.error(portalDealId, `Error mapping v1 ${portalDealId} to v2.`);
    log.addError(portalDealId, `Error mapping v1 ${portalDealId} to v2.`);
    return false;
  }

  const mappedV2 = {
    ...dealRoot,
    details,
    eligibility,
    submissionDetails,
    dealFiles,
    bondTransactions,
    loanTransactions,
    ...comments,
    editedBy: [],
    mandatoryCriteria,
    exporter,
  };

  return mappedV2;
};

const archiveFile = async (dealId) => {
  const filename = `deal_${dealId}.xml`;
  const folder = `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}/${dealId}`;

  const from = {
    fileshare: 'workflow',
    folder,
    filename,
  };

  const to = {
    fileshare: 'workflow',
    folder: `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}_archived_success/${dealId}`,
    filename,
  };
  fileshare.moveFile({ to, from }).then(() => {
    fileshare.deleteDirectory('workflow', folder);
  });
};

const processXml = async (dealId) => {
  const dealXml = await fileshare.readFile({ fileshare: 'workflow', folder: `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}/${dealId}`, filename: `deal_${dealId}.xml` });

  const { Deal: workflowDeal } = await xml2js.parseStringPromise(dealXml.toString(), { ignoreAttrs: true, explicitArray: false, valueProcessors: [convertHtmlEntities] });
  return workflowDeal;
};

const importSingleDeal = async (dealId) =>
  processXml(dealId).then(async (workflowDeal) => mapV2(dealId, workflowDeal).then(async (v2Deal) => {
    if (v2Deal) {
      const success = await api.importDeal(v2Deal, token).then(async ({ success, deal }) => {
        if (success) {
          log.addSuccess(dealId);
        } else if (deal.validationErrors) {
          log.addError(dealId, deal.validationErrors.errorList);
        } else if (deal.errmsg) {
          log.addError(dealId, deal.errmsg);
        } else {
          log.addError(dealId, 'unknown API deal create error');
        }
        return success;
      });
      return success;
    }

    console.error(portalDealId, `Error mapping v1 ${portalDealId} to v2`);
    log.addError(portalDealId, `Error mapping v1 ${portalDealId} to v2`);
    return false;
  }));

const migrateDeals = async () => {
  const dealFolders = await fileshare.listDirectoryFiles({ fileshare: 'workflow', folder: AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER });
  importDealCount = dealFolders.length;

  for (let i = 0; i < dealFolders.length; i += 1) {
    console.info(`processing deal ${i + 1}: DealId ${dealFolders[i].name}`);
    // eslint-disable-next-line no-await-in-loop
    const success = await importSingleDeal(dealFolders[i].name);
    consoleLogColor(`Processed ${i + 1} of ${dealFolders.length}: DealId ${dealFolders[i].name}`, success ? 'green' : 'red');
  }
};

const doMigrate = async () => {
  await init();
  await migrateDeals();
  await teardown();
};

doMigrate();
