const { initBanks } = require('../helpers/banks');
const { initUsers } = require('../helpers/users');
const log = require('../helpers/logs');
const mapDeal = require('./map-deal');
const mapFacilities = require('./map-facilities');
const api = require('../api');
const {
  getToken,
  removeMigrationUser,
} = require('../temporary-token-handler');
const {
  dealMappingErrors,
  facilitiesMappingErrors,
} = require('./mapping-errors');

let token;
let v2Banks;
let v2Users;
let logFile;

const init = async () => {
  token = await getToken();
  v2Banks = await initBanks(token);
  v2Users = await initUsers(token);
  logFile = log.init('migrate-deals-GEF');

  return {
    v2Banks,
    v2Users,
  };
};

const mapToV2 = async (v1Deal, v2Banks, v2Users) => {
  const v2Deal = await mapDeal(token, v1Deal, v2Banks, v2Users);

  const v1Facilities = v1Deal.children.facilities;
  const v2Facilities = mapFacilities(
    v1Facilities,
    v1Deal.changed,
    v2Deal.submissionDate,
  );

  const v1DealId = v2Deal.dataMigration.drupalDealId;

  const dealErrors = dealMappingErrors(v2Deal, v1DealId);
  const facilitiesErrors = facilitiesMappingErrors(v2Facilities, v1DealId);

  if (dealErrors) {
    log.addError(v1DealId, `Error mapping v1 GEF deal.`);
  }

  if (facilitiesErrors) {
    log.addError(v1DealId, `Error mapping v1 GEF facilities.`);
  }

  let mappingErrors;
  const hasMappingErrors = (dealErrors || facilitiesErrors);

  if (hasMappingErrors) {
    mappingErrors = {};
  }

  if (dealErrors) {
    mappingErrors.deal = dealErrors;
  }

  if (facilitiesErrors) {
    mappingErrors.facilities = facilitiesErrors;
  }

  return {
    mappingErrors,
    v2Deal,
    v2Facilities,
  };
};

const addToDatabase = async (v2Deal, v2Facilities) => {
  const v1DealId = v2Deal.dataMigration.drupalDealId;

  await api.importGefDeal(v2Deal, v2Facilities, token).then(async ({ success, data }) => {
    const { deal, facilities } = data;

    if (success && deal && facilities) {
      log.addSuccess(v1DealId, 'Successfully migrated v1 GEF deal');
    } else {
      log.addError(v1DealId, `Error adding v1 GEF deal to database.`);
    }
  });
};

const teardown = async () => {
  await removeMigrationUser();
  console.info(`Log file: ${logFile}`);
};

module.exports = {
  init,
  mapToV2,
  addToDatabase,
  teardown,
};
