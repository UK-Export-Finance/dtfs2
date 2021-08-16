const { capitalizeFirstLetter } = require('../../utils/string');

const generateFacilitiesListString = (facilities) => facilities.reduce((acc, facility) => {
  const {
    facilityType, ukefFacilityID, bankReferenceNumber, uniqueIdentificationNumber,
  } = facility;
  const fType = capitalizeFirstLetter(facilityType);
  const bankReference = uniqueIdentificationNumber || bankReferenceNumber;
  const bankRefString = bankReference
    ? `with your reference ${bankReference} `
    : '';

  return `${acc}- ${fType} facility ${bankRefString}has been given the UKEF reference: ${ukefFacilityID} \n`;
}, '');

const generateBSSListString = (facilities) => {
  if (facilities.length) {
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

    if (bssList.length) {
      const heading = '#Bond Support Scheme\n\n';
      return `${heading}${bssList}`;
    }
  }

  return [];
};

const generateEWCSListString = (facilities) => {
  if (facilities.length) {
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

    if (ewcsList.length) {
      const heading = '#Export Working Capital Scheme\n\n';
      return `${heading}${ewcsList}`;
    }
  }

  return [];
};

module.exports = {
  generateFacilitiesListString,
  generateBSSListString,
  generateEWCSListString,
};
