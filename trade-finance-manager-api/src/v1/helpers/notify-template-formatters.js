const { capitalizeFirstLetter } = require('../../utils/string');

const generateFacilitiesListString = (facilities) => facilities.reduce((acc, facility) => {
  const {
    facilityType, ukefFacilityID, bankReferenceNumber, uniqueIdentificationNumber,
  } = facility.facilitySnapshot;
  const fType = capitalizeFirstLetter(facilityType);
  const bankReference = uniqueIdentificationNumber || bankReferenceNumber;
  const bankRefString = bankReference
    ? `with your reference ${bankReference} `
    : '';

  return `${acc}- ${fType} facility ${bankRefString}has been given the UKEF reference: ${ukefFacilityID} \n`;
}, '');

const generateBSSListString = (facilities) => {
  const bssList = facilities.reduce((acc, facility) => {
    const {
      bondType, ukefFacilityID, bankReferenceNumber, uniqueIdentificationNumber,
    } = facility;

    const bankReference = uniqueIdentificationNumber || bankReferenceNumber;
    const bankRefString = bankReference
      ? `*Your bank ref: ${bankReference}\n`
      : '';

    return `${acc}*${bondType}\n${bankRefString}*UKEF facility ID: ${ukefFacilityID} \n\n`;
  }, '');
  const bssHeading = bssList ? '#Bond Support Scheme\n\n' : '';
  return `${bssHeading}${bssList}`;
};

const generateEWCSListString = (facilities) => {
  const ewcsList = facilities.reduce((acc, facility) => {
    const {
      ukefFacilityID, bankReferenceNumber, uniqueIdentificationNumber,
    } = facility;

    const bankReference = uniqueIdentificationNumber || bankReferenceNumber;
    const bankRefString = bankReference
      ? `*Your bank ref: ${bankReference}\n`
      : '';

    return `${acc}${bankRefString}*UKEF facility ID: ${ukefFacilityID}\n\n`;
  }, '');
  const bssHeading = ewcsList ? '#Export Working Capital Scheme\n\n' : '';
  return `${bssHeading}${ewcsList}`;
};

module.exports = {
  generateFacilitiesListString,
  generateBSSListString,
  generateEWCSListString,
};
