const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const mapDeal = require('./map-deal');
const mapFacilities = require('./map-facilities');
const api = require('../api');
const { getToken, removeMigrationUser } = require('../temporary-token-handler');

const { file } = args;
let token;

const init = async () => {
  token = await getToken();
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

  const v2Deal = mapDeal(v1Deal);

  const v1Facilities = v1Deal.children.facilities;
  const v2Facilities = mapFacilities(v1Facilities, v2Deal.submissionDate);  

  return {
    v2Deal,
    v2Facilities,
  };
};

const addToDatabase = async (v2Deal) => {
  const success = await api.importGefDeal(v2Deal, token).then(async ({ success, deal }) => {
    console.log('add to db - -----  success ', success);
    console.log('add to db - -----  deal \n', deal);
  });
};

const doMigration = async () => {
  await init();

  const {
    v2Deal,
    v2Facilities,
  } = mapToV2();

  await addToDatabase(v2Deal);
  await teardown();
};

doMigration();
