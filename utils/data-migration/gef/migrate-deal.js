const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const { initUsers } = require('../helpers/users');
const mapDeal = require('./map-deal');
const mapFacilities = require('./map-facilities');
const api = require('../api');
const { getToken, removeMigrationUser } = require('../temporary-token-handler');

const { file } = args;
let token;
let v2Users;

const init = async () => {
  token = await getToken();
  v2Users = await initUsers(token);
};

const teardown = async () => {
  await removeMigrationUser();
};

const loadDealFromFile = () => {
  const jsonBuffer = fs.readFileSync(file);
  return JSON.parse(jsonBuffer);
};

const mapToV2 = () => {
  const v1Deal = loadDealFromFile();

  const v2Deal = mapDeal(v1Deal, v2Users);

  const v1Facilities = v1Deal.children.facilities;
  const v2Facilities = mapFacilities(v1Facilities, v2Deal.submissionDate);  

  return {
    v2Deal,
    v2Facilities,
  };
};

const addToDatabase = async (v2Deal, v2Facilities) => {
  await api.importGefDeal(v2Deal, v2Facilities, token).then(async ({ success, data }) => {
    const { deal, facilities } = data;

    if (success && deal && facilities) {
      console.info(`Migrated v1 GEF deal ${v2Deal.dataMigration.drupalDealId} to v2`);
    } else {
      console.error(`Error Migrating v1 GEF deal ${v2Deal.dataMigration.drupalDealId} to v2`);
    }
  });
};

const doMigration = async () => {
  await init();

  const {
    v2Deal,
    v2Facilities,
  } = mapToV2();

  await addToDatabase(
    v2Deal,
    v2Facilities,
  );

  await teardown();
};

doMigration();
