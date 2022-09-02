/* eslint-disable no-await-in-loop */
const { format, getUnixTime } = require('date-fns');
const commaNumber = require('comma-number');
const { findLatestCompletedAmendment } = require('../helpers/amendment.helpers');
const facilityValueFormatted = require('../helpers/facilityValueFormatted.helper');
const { getAllFacilities } = require('../../v1/controllers/facility.controller');

// list all facilities from the database
exports.queryAllFacilities = async (queryParams) => {
  if (!queryParams?.params) {
    return {};
  }
  const rawFacilities = await getAllFacilities(queryParams.params);
  const facilities = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const item of rawFacilities) {
    const { tfmFacilities: facility } = item;

    // finds latest completed amendment tfm object with mapped values
    const latestCompletedAmendment = findLatestCompletedAmendment(item?.amendments);

    const defaultFacilityValue = facilityValueFormatted(facility.value);
    const defaultCoverEndDate = facility.coverEndDate;
    const formatCoverEndDate = format(new Date(defaultCoverEndDate), 'dd LLL yyyy'); // 11 Aug 2021

    // sets the values based on original facility value
    let currencyAndValue = `${facility.currency} ${commaNumber(defaultFacilityValue)}`;
    let facilityValue = parseInt(facility.value, 10);
    let facilityCoverEndDate = facility.coverEndDate ? formatCoverEndDate : '';
    let coverEndDateEpoch = facility.coverEndDate ? getUnixTime(new Date(facility.coverEndDate)) : '';

    // if amendment, then willset relevant values based on amendment
    if (latestCompletedAmendment?.value) {
      const { value, currency } = latestCompletedAmendment.value;
      const formattedValue = facilityValueFormatted(value);
      currencyAndValue = `${currency} ${commaNumber(formattedValue)}`;
      facilityValue = parseInt(value, 10);
    }

    if (latestCompletedAmendment?.coverEndDate) {
      const { coverEndDate } = latestCompletedAmendment;
      // * 1000 so to convert to ms epoch time format so can be correctly formatted by template
      facilityCoverEndDate = format(new Date(coverEndDate * 1000), 'dd LLL yyyy');
      coverEndDateEpoch = coverEndDate;
    }

    facility.coverEndDate = facilityCoverEndDate;
    // the EPOCH format is required to sort the facilities based on date
    facility.coverEndDateEpoch = coverEndDateEpoch;
    facility.currencyAndValue = currencyAndValue;
    facility.value = facilityValue;

    facilities.push(facility);
  }

  return { tfmFacilities: facilities };
};
