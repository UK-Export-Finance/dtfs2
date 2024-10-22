const { format, parseISO } = require('date-fns');
const { DATE_FORMATS } = require('@ukef/dtfs2-common');
const getFacilitiesByType = require('../../helpers/get-facilities-by-type');
const { generateHeadingString, generateListItemString } = require('../../helpers/notify-template-formatters');
const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('./gef-facilities-content-strings');

/*
 * mapIssuedValue
 * map to be the same value that's displayed in Portal UI.
 */
const mapIssuedValue = (hasBeenIssued) => {
  if (hasBeenIssued) {
    return CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED;
  }

  return CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED;
};

/**
 * @param {unknown} value
 * @returns {string | undefined} Returns 'Yes'/'No' if value is True/False, or undefined otherwise
 * @protected this function is exported for unit testing only. If it is used elsewhere it should be moved to a suitable commonised helper file
 */
const mapBooleanToYesOrNo = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return undefined;
};

/*
 * facilityFieldsObj
 * returns a new object with the fields/values we need to consume and display in the email.
 */
const facilityFieldsObj = ({
  ukefFacilityId,
  bankReference,
  hasBeenIssued,
  coverStartDate,
  coverEndDate,
  isUsingFacilityEndDate,
  facilityEndDate,
  bankReviewDate,
  value,
  currencyCode,
  coverPercentage,
  interestPercentage,
  guaranteeFee,
  ukefExposure,
  feeType,
  feeFrequency,
  dayCountBasis,
}) => ({
  ukefFacilityId,
  bankReference,
  hasBeenIssued: hasBeenIssued && mapIssuedValue(hasBeenIssued),
  coverStartDate: coverStartDate && format(Number(coverStartDate), DATE_FORMATS.DO_MMMM_YYYY),
  coverEndDate: coverEndDate && format(parseISO(coverEndDate), DATE_FORMATS.DO_MMMM_YYYY),
  isUsingFacilityEndDate: mapBooleanToYesOrNo(isUsingFacilityEndDate),
  facilityEndDate: facilityEndDate && format(parseISO(facilityEndDate), DATE_FORMATS.DO_MMMM_YYYY),
  bankReviewDate: bankReviewDate && format(parseISO(bankReviewDate), DATE_FORMATS.DO_MMMM_YYYY),
  value,
  currencyCode,
  coverPercentage: coverPercentage && `${coverPercentage}%`,
  interestPercentage: interestPercentage && `${interestPercentage}%`,
  guaranteeFee: guaranteeFee && `${guaranteeFee}%`,
  ukefExposure,
  feeType,
  feeFrequency,
  dayCountBasis,
});

/*
 * generateFacilityFieldListItemString
 * returns a formatted string for a single field/list item.
 */
const generateFacilityFieldListItemString = (type, fieldName, fieldValue) => {
  const title = CONTENT_STRINGS.LIST_ITEM_TITLES[type?.toUpperCase()][fieldName];

  return generateListItemString(`${title}: ${fieldValue}`);
};

/*
 * generateFacilityFieldsListString
 * returns a formatted string for multiple fields in a single facility.
 */
const generateFacilityFieldsListString = (facility) => {
  let singleFacilityListString = '';

  const fields = facilityFieldsObj(facility);

  // for each field, generate a string with title and value.
  Object.keys(fields).forEach((fieldName) => {
    const value = fields[fieldName];

    if (value) {
      singleFacilityListString += generateFacilityFieldListItemString(facility.type, fieldName, value);
    }
  });

  return singleFacilityListString;
};

/*
 * generateFacilitiesListString
 * returns a formatted string for multiple facilities.
 * For each facility, this generates a heading and list of facility fields.
 */
const generateFacilitiesListString = (heading, facilities) => {
  const formattedHeading = generateHeadingString(heading);
  let listString = '';

  facilities.forEach((facility) => {
    listString += `\n\n${formattedHeading}`;
    listString += generateFacilityFieldsListString(facility);
  });

  return listString;
};

/*
 * For each type of facility, we need to send a single variable to Notify
 * that contains a string for each facility of that type.
 * If for example there are 2 Cash facilities and 2 Contingent facilities:
 * - cashFacilitiesList will return a formatted string of all cash facilities.
 * - contingentFacilitiesList will return a formatted string of all cash facilities.
 * - example of one list:
 * - '#Facility 1 Heading\n\n*Facility 1 - Item 1\n*Facility 1 -
 * Item 2\n#Facility 2 Heading\n\n*Facility 2 - Item 1\n*Facility 2 - Item 2\n'
 * Each facility (of any type) requires:
 * - a heading
 * - multiple list items from facility data
 */
const gefFacilitiesList = (facilities) => {
  const { cashes, contingents } = getFacilitiesByType(facilities);

  let cashesListString = '';
  let contingentsListString = '';

  if (cashes) {
    cashesListString = generateFacilitiesListString(CONTENT_STRINGS.HEADINGS.CASH, cashes);
  }

  if (contingents) {
    contingentsListString = generateFacilitiesListString(CONTENT_STRINGS.HEADINGS.CONTINGENT, contingents);
  }

  return {
    cashes: cashesListString,
    contingents: contingentsListString,
  };
};

module.exports = {
  mapBooleanToYesOrNo,
  mapIssuedValue,
  facilityFieldsObj,
  generateFacilityFieldListItemString,
  generateFacilityFieldsListString,
  generateFacilitiesListString,
  gefFacilitiesList,
};
