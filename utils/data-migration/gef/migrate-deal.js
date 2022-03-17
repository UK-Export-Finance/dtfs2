const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const {
  init,
  mapToV2,
  addToDatabase,
  teardown,
} = require('./migrate');
const log = require('../logs');

const { file } = args;

const loadDealFromFile = () => {
  const jsonBuffer = fs.readFileSync(file);
  return JSON.parse(jsonBuffer);
};

const doMigration = async () => {
  const { v2Banks, v2Users } = await init();

  const v1Deal = loadDealFromFile();

  const {
    mappingErrors,
    v2Deal,
    v2Facilities,
  } = await mapToV2(v1Deal, v2Banks, v2Users);

  if (!mappingErrors) {
    await addToDatabase(
      v2Deal,
      v2Facilities,
    );
  }

  const errorCount = log.getErrorCount();
  const successCount = log.getSuccessCount();

  if (errorCount !== 0) {
    log.addInfo(`Error migrating deal ${v2Deal.dataMigration.drupalDealId}`);
  }

  if (successCount > 0) {
    log.addInfo(`Successfully migrated deal ${v2Deal.dataMigration.drupalDealId}`);
  }

  await teardown();
};

doMigration();
