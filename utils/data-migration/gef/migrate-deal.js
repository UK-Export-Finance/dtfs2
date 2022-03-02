const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const mapDeal = require('./map-deal');
const mapFacilities = require('./map-facilities');

const { file } = args;

const loadDealFromFile = () => {
  const jsonBuffer = fs.readFileSync(file);
  return JSON.parse(jsonBuffer);
};

const v1Deal = loadDealFromFile();

const v2Deal = mapDeal(v1Deal);

const v1Facilities = v1Deal.children.facilities;
const v2Facilities = mapFacilities(v1Facilities, v2Deal.submissionDate);

console.log('--- v2Deal \n', v2Deal);
console.log('--- v2Facilities \n', v2Facilities);
