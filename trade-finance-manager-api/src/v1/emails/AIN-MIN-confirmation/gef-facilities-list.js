const getFacilitiesByType = require('../../helpers/get-facilities-by-type');
const {
  generateHeadingString,
  generateListItemString,
} = require('../../helpers/notify-template-formatters');
const CONTENT_STRINGS = require('./gef-facilities-content-strings');

/*
* facilityFieldsObj
* returns a new object with the fields/values we need.
*/
const facilityFieldsObj = (facility) => {
  // TODO: better way to reference fields to avoid duplication. DRY
  const fields = (({
    ukefFacilityID,
    _id,
    bankReference,
    hasBeenIssued,
    // requestedCoverStartDate 'TODO: need logic and updated mapping',
    coverStartDate,
    value,
    currencyCode,
    interestPercentage,
    coverPercentage,
    // Minimum risk margin fee 'TODO need confirmation on field',
    guaranteeFee,
    ukefExposure,
    feeType,
    feeFrequency,
    dayCountBasis,
  }) => ({
    ukefFacilityID,
    _id,
    bankReference,
    hasBeenIssued,
    // requestedCoverStartDate 'TODO: need logic and updated mapping',
    coverStartDate,
    value,
    currencyCode,
    interestPercentae,
    coverPercentage,
    // Minimum risk margin fee 'TODO need confirmation on field',
    guaranteeFee,
    ukefExposure,
    feeType,
    feeFrequency,
    dayCountBasis,
  }))(facility);

  return fields;
};

/*
* generateFacilityListItemString
* returns a formatted string for a single field/list item.
*/
const generateFacilityListItemString = (fieldName, fieldValue) => {
  const title = CONTENT_STRINGS[fieldName];

  const str = generateListItemString(`${title}: ${fieldValue}`);

  return str;
};

/*
* generateSingleFacilityListString
* returns a formatted string for multiple fields in a single facility.
*/
const generateSingleFacilityListString = (facility) => {
  const singleFacilityListString = '';

  const fields = facilityFieldsObj(facility);

  // for each field, generate a string with title and value.
  Object.keys(fields).forEach((fieldName) => {
    const value = fields[fieldName];

    singleFacilityListString += generateFacilityListItemString(fieldName, value);
  });

  return singleFacilityListString;
};

/*
* For each type of facility, we need to send a single variable to Notify that contains a string for each facility of that type.
* If for example there are 2 Cash facilites and 2 Contingent facilities:
* - cashFacilitiesList will return a formatted string of all cash facilities.
* - contingentFacilitiesList will return a formatted string of all cash facilities.
* - example of one list:
* - '#Facility 1 Heading\n\n*Facility 1 - Item 1\n*Facility 1 - Item 2\n#Facility 2 Heading\n\n*Facility 2 - Item 1\n*Facility 2 - Item 2\n'
* Each facility (of any type) requires:
* - a heading
* - multiple list items from facility data
*/
const gefFacilitiesList = (facilities) => {
  const {
    cashes,
    contingents,
  } = getFacilitiesByType(facilities);

  let cashFacilitiesList = '';
  let contingentFacilitiesList = '';

  if (cashes) {
    const heading = generateHeadingString(CONTENT_STRINGS.HEADINGS.CASH);

    cashes.forEach((facility) => {
      const singleFacilityListString = generateSingleFacilityListString(facility);

      cashFacilitiesList += `${heading}${singleFacilityListString}`;
    });
  }

  if (contingents) {
    const contingentHeading = generateHeadingString(`${CONTENT_STRINGS.HEADINGS.CONTINGENT}:`);

    contingents.forEach((facility) => {
      const singleFacilityListString = generateSingleFacilityListString(facility);

      contingentFacilitiesList += `${heading}${singleFacilityListString}`;
    });
  }

  return {
    cashFacilitiesList,
    contingentFacilitiesList,
  };
};

module.exports = gefFacilitiesList;
