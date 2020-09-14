const xml2js = require('xml2js');
const fileshare = require('./helpers/fileshare');
const { mapDetails } = require('./helpers/map');
const { initBanks } = require('./helpers/banks');
const { initUsers } = require('./helpers/users');
const consoleLogColor = require('./helpers/console-log-colour');

const log = require('./helpers/log');
const { getToken, removeMigrationUser } = require('./temporary-token-handler');
const api = require('./api');


let token;
let logFile;
let importDealCount;

const init = async () => {
  token = await getToken();
  await initBanks(token);
  await initUsers(token);
  logFile = log.init('migrate-deals');
};

const mapV2 = async (portalDealId, v1Deal) => {
  const details = mapDetails(portalDealId, v1Deal);

  if (!details) {
    return false;
  }

  const mappedV2 = {
    dataMigrationInfo: {
      v1_ID: portalDealId,
    },
    bankSupplyContractName: v1Deal.General_information.Deal_name,
    details,
  };

  return mappedV2;
};

const teardown = async () => {
  await removeMigrationUser();
  const successCount = log.getSuccessCount();
  consoleLogColor(`Migrated ${successCount} of ${importDealCount}`, successCount === importDealCount ? 'green' : 'red');
  console.log(`Log file: ${logFile}`);
};

const processXml = async (dealId) => {
  const dealXml = await fileshare.readFile({ folder: `${fileshare.dealDir}/${dealId}`, filename: `deal_${dealId}.xml` });
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(dealXml.toString(), { ignoreAttrs: true, explicitArray: false });
  return workflowDeal;
};

const migrateDeals = async () => {
  const dealFolders = await fileshare.listDirectoryFiles({ fileshare: 'workflow', folder: fileshare.dealDir });
  importDealCount = dealFolders.length;

  const createDealPromises = [];

  dealFolders.forEach(async ({ name: dealId }) => {
    const createDealPromise = new Promise((resolve) => {
      processXml(dealId).then((workflowDeal) => {
        mapV2(dealId, workflowDeal).then((v2Deal) => {
          if (v2Deal) {
            api.createDeal(v2Deal, token).then(({ success, deal }) => {
              if (success) {
                consoleLogColor(`created deal: ${dealId}`, 'green');
                log.addSuccess(dealId, deal._id);
                resolve(dealId);
              } else {
                consoleLogColor(`error creating deal: ${dealId}`);
                if (deal.validationErrors) {
                  log.addError(dealId, deal.validationErrors.errorList);
                } else {
                  log.addError(dealId, 'unknown API deal create error');
                }

                resolve(dealId);
              }
            });
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
