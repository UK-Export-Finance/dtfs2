/* eslint-disable no-await-in-loop */
const { format, getUnixTime } = require('date-fns');
const commaNumber = require('comma-number');
const api = require('../../v1/api');

const { getAllFacilities } = require('../../v1/controllers/facility.controller');
// list all facilities from the database
exports.queryAllFacilities = async (queryParams) => {
  const rawFacilities = await getAllFacilities(queryParams.params);
  const facilities = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of rawFacilities) {
    const { tfmFacilities: facility } = item;
    const { facilityId } = facility;

    // checks for amended facility value or coverEndDate
    const latestCompletedAmendmentValue = await api.getLatestCompletedValueAmendment(facilityId);
    const latestCompletedAmendmentCoverEndDate = await api.getLatestCompletedDateAmendment(facilityId);

    const defaultFacilityValue = facility.value;
    const defaultCoverEndDate = facility.coverEndDate;
    const formatCoverEndDate = format(new Date(defaultCoverEndDate), 'dd LLL yyyy'); // 11 Aug 2021

    // sets the values based on original facility value
    let currencyAndValue = `${facility.currency} ${commaNumber(defaultFacilityValue)}`;
    let facilityValue = parseInt(facility.value, 10);
    let facilityCoverEndDate = facility.coverEndDate ? formatCoverEndDate : '';
    let coverEndDateEpoch = facility.coverEndDate ? getUnixTime(new Date(facility.coverEndDate)) : '';

    // if amendment, then willset relevant values based on amendment
    if (latestCompletedAmendmentValue?.value) {
      const { value, currency } = latestCompletedAmendmentValue;
      currencyAndValue = `${currency} ${commaNumber(value)}`;
      facilityValue = parseInt(value, 10);
    }

    if (latestCompletedAmendmentCoverEndDate?.coverEndDate) {
      const { coverEndDate } = latestCompletedAmendmentCoverEndDate;
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
