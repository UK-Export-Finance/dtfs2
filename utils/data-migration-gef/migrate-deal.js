const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const mapDeal = require('./map-deal');

const { file } = args;

const loadDealFromFile = () => {
  const jsonBuffer = fs.readFileSync(file);
  return JSON.parse(jsonBuffer);
};

const v1Deal = loadDealFromFile();

const v2Deal = mapDeal(v1Deal);

console.log('--- v2Deal \n', v2Deal);
