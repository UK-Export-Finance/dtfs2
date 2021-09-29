const { titleCaseString } = require('../../../../utils/string');

const mapGefFacilityProvidedOn = (details) =>
  details.map((d) => titleCaseString(d));


module.exports = mapGefFacilityProvidedOn;
