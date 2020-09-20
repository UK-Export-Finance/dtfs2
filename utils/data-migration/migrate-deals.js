const xml2js = require('xml2js');
const fileshare = require('./helpers/fileshare');
require('dotenv').config();
const {
  mapDetails, mapEligibility, mapSubmissionDetails, mapDealFiles,
} = require('./maps');
const { initBanks } = require('./helpers/banks');
const { initUsers } = require('./helpers/users');
const { initCountries } = require('./helpers/countries');
const { initCurrencies } = require('./helpers/currencies');

const consoleLogColor = require('./helpers/console-log-colour');

const log = require('./helpers/log');
const { getToken, removeMigrationUser } = require('./temporary-token-handler');
const api = require('./api');


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
  fileshare.setConfig(AZURE_WORKFLOW_FILESHARE_CONFIG);
  logFile = log.init('migrate-deals');
};

const teardown = async () => {
  await removeMigrationUser();
  const successCount = log.getSuccessCount();
  consoleLogColor(`Migrated ${successCount} of ${importDealCount}`, successCount === importDealCount ? 'green' : 'red');
  console.log(`Log file: ${logFile}`);
};

const mapV2 = async (portalDealId, v1Deal) => {
  const [details, detailsError] = mapDetails(portalDealId, v1Deal);
  const [eligibility, eligibilityError] = mapEligibility(portalDealId, v1Deal);
  const [submissionDetails, submissionDetailsError] = mapSubmissionDetails(portalDealId, v1Deal);
  const [dealFiles, dealFilesError] = mapDealFiles(portalDealId, v1Deal);

  if (detailsError || eligibilityError || submissionDetailsError || dealFilesError) {
    return false;
  }

  const mappedV2 = {
    dataMigrationInfo: {
      v1_ID: portalDealId,
    },
    bankSupplyContractName: v1Deal.General_information.Deal_name,
    details,
    eligibility,
    submissionDetails,
    dealFiles,
    bondTransactions: { items: [] },
    loanTransactions: { items: [] },
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

  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(dealXml.toString(), { ignoreAttrs: true, explicitArray: false });
  return workflowDeal;
};

const migrateDeals = async () => {
  const dealFolders = await fileshare.listDirectoryFiles({ fileshare: 'workflow', folder: AZURE_WORKFLOW_FILESHARE_CONFIG.MIGRATION_FOLDER });
  importDealCount = dealFolders.length;

  const createDealPromises = [];

  let dealCount = 0;
  dealFolders.forEach(async ({ name: dealId }) => {
    const createDealPromise = new Promise((resolve) => {
      processXml(dealId).then((workflowDeal) => {
        mapV2(dealId, workflowDeal).then((v2Deal) => {
          if (v2Deal) {
            api.importDeal(v2Deal, token).then(async ({ success, deal }) => {
              if (success) {
                //                consoleLogColor(`created deal: ${dealId}`, 'green');
                log.addSuccess(dealId, deal._id);
              } else if (deal.validationErrors) {
                log.addError(dealId, deal.validationErrors.errorList);
              } else {
                log.addError(dealId, 'unknown API deal create error');
              }

              dealCount += 1;
              if (success) {
                // await archiveFile(dealId);
              }
              consoleLogColor(`Processed ${dealCount} of ${dealFolders.length}`, success ? 'green' : 'red');
              resolve(dealId);
            });
          } else {
            dealCount += 1;
            consoleLogColor(`Processed ${dealCount} of ${dealFolders.length}`, 'red');
            resolve(dealId);
          }
        });
      });
    });

    createDealPromises.push(createDealPromise);
  });

  await Promise.all(createDealPromises);
};

const doMigrate = async () => {
  await init();
  await migrateDeals();
  await teardown();
};

doMigrate();
