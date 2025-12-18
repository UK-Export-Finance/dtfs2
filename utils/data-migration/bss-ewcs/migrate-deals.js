const xml2js = require('xml2js');
const { decodeHtmlEntities } = require('@ukef/dtfs2-common');
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
const { initBanks } = require('../helpers/banks');
const { initUsers } = require('../helpers/users');
const { initCountries } = require('./helpers/countries');
const { initCurrencies } = require('./helpers/currencies');
const { initIndustrySectors } = require('./helpers/industry-sectors');
const consoleLogColor = require('./helpers/console-log-colour');
const shouldMigrateDeal = require('./helpers/should-migrate-deal');

const log = require('../helpers/logs');
const { getToken, removeMigrationUser } = require('../temporary-token-handler');
const api = require('../api');

let token;
let logFile;
let importDealCount;
let banks;

const AZURE_WORKFLOW_FILESHARE_CONFIG = {
  FILESHARE_NAME: process.env.MIGRATION_AZURE_WORKFLOW_FILESHARE_NAME,
  MIGRATION_FOLDER: process.env.MIGRATION_AZURE_WORKFLOW_MIGRATION_FOLDER,
  STORAGE_ACCOUNT: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCOUNT,
  STORAGE_ACCESS_KEY: process.env.MIGRATION_AZURE_WORKFLOW_STORAGE_ACCESS_KEY,
};

const init = async (authToken) => {
  banks = await initBanks(authToken);
  await initUsers(authToken);
  await initCountries(authToken);
  await initCurrencies(authToken);
  await initIndustrySectors(authToken);
  fileshare.setConfig(AZURE_WORKFLOW_FILESHARE_CONFIG);
  logFile = log.init('migrate-deals');
};

const teardown = async (authToken) => {
  await removeMigrationUser(authToken);
  const successCount = log.getSuccessCount();
  consoleLogColor(`Migrated ${successCount} of ${importDealCount}`, successCount === importDealCount ? 'green' : 'red');
  console.info(`Log file: ${logFile}`);
};

const mapV2 = async (portalDealId, v1Deal) => {
  const [dealRoot, dealRootError] = mapDealRoot(portalDealId, v1Deal, banks);
  const [details, detailsError] = mapDetails(portalDealId, v1Deal, dealRoot.submissionType);
  const [eligibility, eligibilityError] = mapEligibility(portalDealId, v1Deal);
  const [submissionDetails, submissionDetailsError] = mapSubmissionDetails(portalDealId, v1Deal);
  const [supportingInformation, dealFilesError] = await mapDealFiles(portalDealId, v1Deal);
  const [bondTransactions, bondTransactionsError] = mapBondTransactions(portalDealId, v1Deal);
  const [loanTransactions, loanTransactionsError] = mapLoanTransactions(portalDealId, v1Deal);
  const comments = mapComments(v1Deal);
  const mandatoryCriteria = mapMandatoryCriteria(v1Deal);
  const exporter = mapExporter(v1Deal);

  if (dealRootError || detailsError || eligibilityError || submissionDetailsError || dealFilesError || bondTransactionsError || loanTransactionsError) {
    console.error(portalDealId, `Error mapping v1 ${portalDealId} to v2.`);
    log.addError(portalDealId, `Error mapping v1 ${portalDealId} to v2.`);
    return false;
  }

  const mappedV2 = {
    ...dealRoot,
    details,
    eligibility,
    submissionDetails,
    supportingInformation,
    bondTransactions,
    loanTransactions,
    ...comments,
    editedBy: [],
    mandatoryCriteria,
    exporter,
  };

  return mappedV2;
};

const processXml = async (dealId) => {
  const dealXml = await fileshare.readFile({
    fileshare: 'workflow',
    folder: `${AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER}/${dealId}`,
    filename: `deal_${dealId}.xml`,
  });

  const { Deal: workflowDeal } = await xml2js.parseStringPromise(dealXml.toString(), {
    ignoreAttrs: true,
    explicitArray: false,
    valueProcessors: [decodeHtmlEntities],
  });
  return workflowDeal;
};

const importSingleDeal = async (dealId) =>
  processXml(dealId).then(async (workflowDeal) =>
    mapV2(dealId, workflowDeal).then(async (v2Deal) => {
      if (v2Deal) {
        if (shouldMigrateDeal(v2Deal.status)) {
          const completed = await api.importBssEwcsDeal(v2Deal, token).then(async ({ success, deal }) => {
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
          return completed;
        }
      }
      log.addError(dealId, `Error mapping v1 ${dealId} to v2`);

      return false;
    }),
  );

const migrateDeals = async () => {
  const dealFolders = await fileshare.listDirectoryFiles({
    fileshare: 'workflow',
    folder: AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER,
  });
  importDealCount = dealFolders.length;

  for (let i = 0; i < dealFolders.length; i += 1) {
    console.info(`processing deal ${i + 1}: DealId ${dealFolders[i].name}`);
    const success = await importSingleDeal(dealFolders[i].name);
    consoleLogColor(`Processed ${i + 1} of ${dealFolders.length}: DealId ${dealFolders[i].name}`, success ? 'green' : 'red');
  }
};

const doMigrate = async () => {
  token = await getToken();

  await init(token);
  await migrateDeals();
  await teardown(token);
};

doMigrate();
