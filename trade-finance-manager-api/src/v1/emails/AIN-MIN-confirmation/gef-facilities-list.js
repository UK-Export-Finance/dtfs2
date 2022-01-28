const { format } = require('date-fns');
const getFacilitiesByType = require('../../helpers/get-facilities-by-type');
const {
  generateHeadingString,
  generateListItemString,
} = require('../../helpers/notify-template-formatters');
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

/*
* facilityFieldsObj
* returns a new object with the fields/values we need to consume and display in the email.
*/
const facilityFieldsObj = (facility) => {
  const fields = (({
    ukefFacilityId,
    bankReference,
    hasBeenIssued,
    coverStartDate,
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
    hasBeenIssued,
    coverStartDate,
    value,
    currencyCode,
    coverPercentage,
    interestPercentage,
    guaranteeFee,
    ukefExposure,
    feeType,
    feeFrequency,
    dayCountBasis,
  }))(facility);

  // NOTE: we do not want to include shouldCoverStartOnSubmission in the list of fields.
  // Otherwise, the email would split this field out, which is not required in design.
  if (!facility.shouldCoverStartOnSubmission) {
    fields.requestedCoverStartDate = facility.coverStartDate;
  }

  // format for emails
  if (fields.hasBeenIssued) {
    fields.hasBeenIssued = mapIssuedValue(fields.hasBeenIssued);
  }

  if (fields.coverStartDate) {
    fields.coverStartDate = format(Number(fields.coverStartDate), 'do MMMM yyyy');
  }

  if (fields.coverPercentage) {
    fields.coverPercentage = `${fields.coverPercentage}%`;
  }

  if (fields.interestPercentage) {
    fields.interestPercentage = `${fields.interestPercentage}%`;
  }

  if (fields.guaranteeFee) {
    fields.guaranteeFee = `${fields.guaranteeFee}%`;
  }

  return fields;
};

/*
* generateFacilityFieldListItemString
* returns a formatted string for a single field/list item.
*/
const generateFacilityFieldListItemString = (type, fieldName, fieldValue) => {
  const title = CONTENT_STRINGS.LIST_ITEM_TITLES[type?.toUpperCase()][fieldName];

  const str = generateListItemString(`${title}: ${fieldValue}`);

  return str;
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
      singleFacilityListString += generateFacilityFieldListItemString(
        facility.type,
        fieldName,
        value,
      );
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
    listString += formattedHeading;
    listString += generateFacilityFieldsListString(facility);
  });

  return listString;
};

/*
* For each type of facility, we need to send a single variable to Notify
* that contains a string for each facility of that type.
* If for example there are 2 Cash facilites and 2 Contingent facilities:
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
  const {
    cashes,
    contingents,
  } = getFacilitiesByType(facilities);

  let cashesListString = '';
  let contingentsListString = '';

  if (cashes) {
    cashesListString = generateFacilitiesListString(
      CONTENT_STRINGS.HEADINGS.CASH,
      cashes,
    );
  }

  if (contingents) {
    contingentsListString = generateFacilitiesListString(
      CONTENT_STRINGS.HEADINGS.CONTINGENT,
      contingents,
    );
  }

  return {
    cashes: cashesListString,
    contingents: contingentsListString,
  };
};

module.exports = {
  mapIssuedValue,
  facilityFieldsObj,
  generateFacilityFieldListItemString,
  generateFacilityFieldsListString,
  generateFacilitiesListString,
  gefFacilitiesList,
};
