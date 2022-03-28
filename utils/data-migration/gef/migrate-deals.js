const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const {
  init,
  mapToV2,
  addToDatabase,
  teardown,
} = require('./migrate');
const log = require('../helpers/logs');
const shouldMigrateDeal = require('./should-migrate-deal');

const doMigration = async () => {
  const { path } = args;

  const { v2Banks, v2Users } = await init();

  const v1Deals = fs.readdirSync(path);

  const totalV1Deals = v1Deals.length;

  v1Deals.forEach(async (fileName) => {
    const jsonBuffer = fs.readFileSync(`${path}/${fileName}`);
    const v1DealJson = JSON.parse(jsonBuffer);

    if (shouldMigrateDeal(v1DealJson)) {
      const {
        mappingErrors,
        v2Deal,
        v2Facilities,
      } = await mapToV2(v1DealJson, v2Banks, v2Users);

      if (!mappingErrors) {
        const imported = await addToDatabase(
          v2Deal,
          v2Facilities,
        );
      }
    }
  });

  // const errorCount = log.getErrorCount();
  const successCount = log.getSuccessCount();

  // if (errorCount !== 0) {
  //   log.addInfo(`Error migrating ${errorCount} of ${totalV1Deals} V1 deals.`);
  // }

  if (successCount > 0) {
    log.addInfo(`Successfully migrated ${successCount} of ${totalV1Deals} V1 deals.`);
  }

  await teardown();
};

doMigration();
