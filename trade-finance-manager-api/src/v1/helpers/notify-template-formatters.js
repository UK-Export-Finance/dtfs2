const { capitalizeFirstLetter } = require('../../utils/string');
const CONSTANTS = require('../../constants');

const generateFacilitiesListHeading = (facilityType) => {
  let heading;
  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    heading = CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN;
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    heading = CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND;
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH) {
    heading = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility`;
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT) {
    heading = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility`;
  }

  return `#${heading}\n\n`;
};

const generateFacilitiesReferenceListString = (facilities) => facilities.reduce((acc, facility) => {
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

const generateFacilitiesListString = (facilities) => {
  const list = facilities.reduce((acc, facility) => {
    const { ukefFacilityID } = facility;

    let string = `${acc}`;
    let bankReference;

    if (facility.uniqueIdentificationNumber) {
      bankReference = facility.uniqueIdentificationNumber;
    } else if (facility.bankReferenceNumber) {
      bankReference = facility.bankReferenceNumber;
    }

    if (bankReference) {
      const bankRefString = bankReference
        ? `*Your bank ref: ${bankReference}\n`
        : '';

      string += bankRefString;
    }

    string += `*UKEF facility ID: ${ukefFacilityID}\n\n`;

    return string;
  }, '');

  if (list.length) {
    const { facilityType } = facilities[0];

    const heading = generateFacilitiesListHeading(facilityType);
    return `${heading}${list}`;
  }

  return '';
};

module.exports = {
  generateFacilitiesReferenceListString,
  generateFacilitiesListString,
};
