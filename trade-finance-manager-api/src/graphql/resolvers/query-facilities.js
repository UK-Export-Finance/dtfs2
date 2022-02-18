const { format, getUnixTime } = require('date-fns');
const commaNumber = require('comma-number');

const { getAllFacilities } = require('../../v1/controllers/facility.controller');
// list all facilities from the database
exports.queryAllFacilities = async (queryParams) => {
  const rawFacilities = await getAllFacilities(queryParams.params);
  const facilities = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of rawFacilities) {
    const facility = item.tfmFacilities;
    const defaultCoverEndDate = item.tfmFacilities.coverEndDate;
    const formatCoverEndDate = format(new Date(defaultCoverEndDate), 'dd LLL yyyy'); // 11 Aug 2021

    facility.coverEndDate = item.tfmFacilities.coverEndDate ? formatCoverEndDate : '';
    const defaultFacilityValue = item.tfmFacilities.value;
    // the EPOCH format is required to sort the facilities based on date
    facility.coverEndDateEpoch = item.tfmFacilities.coverEndDate ? getUnixTime(new Date(item.tfmFacilities.coverEndDate)) : '';
    facility.currencyAndValue = `${item.tfmFacilities.currency} ${commaNumber(defaultFacilityValue)}`;
    facility.value = parseInt(item.tfmFacilities.value, 10);
    facility.type = item.tfmFacilities.type;
    facilities.push(facility);
  }

  return { tfmFacilities: facilities };
};
