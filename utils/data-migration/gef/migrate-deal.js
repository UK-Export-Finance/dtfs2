const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const {
  init,
  mapToV2,
  addToDatabase,
  teardown,
} = require('./migrate');

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

  await teardown();
};

doMigration();
