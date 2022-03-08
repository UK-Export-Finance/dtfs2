const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const {
  init,
  mapToV2,
  addToDatabase,
  teardown,
} = require('./migrate');


const doMigration = async () => {
  const { path } = args;

  const { v2Users } = await init();

  const v1Deals = fs.readdirSync('gef/dump');

  console.log('v1Deals ', v1Deals);

  // for each...

  v1Deals.forEach(async (fileName) => {

    console.log('fileName ', fileName);

    // const jsonBuffer = fs.readFileSync(file);
    // const jsonBuffer = fs.readFileSync(`gef/dump/${file}`);

    // const jsonBuffer = fs.readFileSync(__dirname + '/dump' + '/' + fileName); // works
    const jsonBuffer = fs.readFileSync(path + '/' + fileName);
    const v1DealJson = JSON.parse(jsonBuffer);
    console.log('v1DealJson \n', v1DealJson);

    const {
      mappingErrors,
      v2Deal,
      v2Facilities,
    } = mapToV2(v1DealJson, v2Users);

    if (!mappingErrors) {
      await addToDatabase(
        v2Deal,
        v2Facilities,
      );
    }
  });

  await teardown();
};

doMigration();
