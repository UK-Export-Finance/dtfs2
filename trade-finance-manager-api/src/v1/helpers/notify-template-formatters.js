const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const generateHeadingString = (heading) => `#${heading}\n\n`;

const generateListItemString = (str) => `*${str}\n`;

const generateFacilitiesListHeading = (type) => {
  let heading;
  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    heading = CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.LOAN;
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    heading = CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.BOND;
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.CASH) {
    heading = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CASH} facility`;
  }

  if (type === CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT) {
    heading = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_NAME.CONTINGENT} facility`;
  }

  return generateHeadingString(heading);
};

const generateFacilitiesListString = (facilities) => {
  const list = facilities.reduce((acc, facility) => {
    const { ukefFacilityId } = facility;

    let string = `${acc}`;
    let bankRef;

    if (facility.name) {
      bankRef = facility.name;
    } else if (facility.bankReference) {
      bankRef = facility.bankReference;
    }

    if (bankRef) {
      const bankRefString = bankRef
        ? `*Your bank ref: ${bankRef}\n`
        : '';

      string += bankRefString;
    }

    string += `*UKEF facility ID: ${ukefFacilityId}\n\n`;

    return string;
  }, '');

  if (list.length) {
    const { type } = facilities[0];

    const heading = generateFacilitiesListHeading(type);
    return `${heading}${list}`;
  }

  return '';
};

const generateBssFacilityLists = (facilities) => {
  const {
    issuedBonds, unissuedBonds, issuedLoans, unissuedLoans,
  } = issuedFacilities(facilities);

  const issuedBondsList = generateFacilitiesListString(issuedBonds);
  const issuedLoansList = generateFacilitiesListString(issuedLoans);

  const unissuedBondsList = generateFacilitiesListString(unissuedBonds);
  const unissuedLoansList = generateFacilitiesListString(unissuedLoans);

  let issued = '';
  if (issuedBondsList.length || issuedLoansList.length) {
    issued = `${issuedBondsList}\n${issuedLoansList}`;
  }

  let unissued = '';
  if (unissuedBondsList.length || unissuedLoansList.length) {
    unissued = `${unissuedBondsList}\n${unissuedLoansList}`;
  }

  return {
    issued,
    unissued,
  };
};

const generateGefFacilityLists = (facilities) => {
  const {
    issuedCash, unissuedCash, issuedContingent, unissuedContingent,
  } = issuedFacilities(facilities);

  const issuedCashList = generateFacilitiesListString(issuedCash);
  const issuedContingentList = generateFacilitiesListString(issuedContingent);

  const unissuedCashList = generateFacilitiesListString(unissuedCash);
  const unissuedContingentList = generateFacilitiesListString(unissuedContingent);

  let issued = '';
  if (issuedCashList.length || issuedContingentList.length) {
    issued = `${issuedCashList}\n${issuedContingentList}`;
  }

  let unissued = '';
  if (unissuedCashList.length || unissuedContingentList.length) {
    unissued = `${unissuedCashList}\n${unissuedContingentList}`;
  }

  return {
    issued,
    unissued,
  };
};

const generateFacilityLists = (dealType, facilities) => {
  let issuedList;
  let unissuedList;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const { issued, unissued } = generateBssFacilityLists(facilities);
    issuedList = issued;
    unissuedList = unissued;
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    const { issued, unissued } = generateGefFacilityLists(facilities);
    issuedList = issued;
    unissuedList = unissued;
  }

  return {
    issued: issuedList,
    unissued: unissuedList,
  };
};

module.exports = {
  generateHeadingString,
  generateListItemString,
  generateFacilitiesListHeading,
  generateFacilitiesListString,
  generateBssFacilityLists,
  generateGefFacilityLists,
  generateFacilityLists,
};
