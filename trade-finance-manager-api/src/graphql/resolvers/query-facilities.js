const { format, getUnixTime } = require('date-fns');

const { getAllFacilities } = require('../../v1/controllers/facility.controller');
const { formattedNumber } = require('../../utils/number');
// list all facilities from the database
exports.queryAllFacilities = async (queryParams) => {
  const rawFacilities = await getAllFacilities(queryParams.params);
  const facilities = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of rawFacilities) {
    const facility = item.tfmFacilities;
    const defaultCoverEndDate = item.tfmFacilities.coverEndDate;
    const formatCoverEndDate = format(new Date(defaultCoverEndDate), 'dd LLL yyyy'); // 11 Aug 2021
    const defaultFacilityValue = parseInt(item.tfmFacilities.value, 10);

    facility.coverEndDate = item.tfmFacilities.coverEndDate ? formatCoverEndDate : '';
    facility.coverEndDateEpoch = item.tfmFacilities.coverEndDate ? getUnixTime(new Date(item.tfmFacilities.coverEndDate)) : '';
    facility.currencyAndValue = `${item.tfmFacilities.currency} ${formattedNumber(defaultFacilityValue)}`;
    facility.value = parseInt(item.tfmFacilities.value, 10);
    facility.facilityType = item.tfmFacilities.facilityType.toLowerCase();
    facilities.push(facility);
  }

  return { tfmFacilities: facilities };
};
