const { getAllFacilities } = require('../../v1/controllers/facility.controller');
const { formattedNumber } = require('../../utils/number');
// list all facilities from the database
exports.queryAllFacilities = async () => {
  const rawFacilities = await getAllFacilities();

  const facilities = [];
  let facility;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of rawFacilities) {
    facility = item.tfmFacilities;
    facility.value = `${item.tfmFacilities.currency} ${formattedNumber(item.tfmFacilities.value)}`;
    facility.facilityType = item.tfmFacilities.facilityType.toLowerCase();
    facilities.push(facility);
  }

  return { tfmFacilities: facilities };
};
