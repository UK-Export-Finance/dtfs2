const { getAllFacilities } = require('../../v1/controllers/facility.controller');
const { formattedNumber } = require('../../utils/number');
// list all facilities from the database
exports.queryAllFacilities = async () => {
  const allFacilities = await getAllFacilities();

  const facilities = [];
  allFacilities.forEach((val) => {
    facilities.push({
      applicationId: val.applicationId,
      companyName: val.companyName,
      coverEndDate: val.coverEndDate,
      dealType: val.dealType,
      facilityType: val.facilityType,
      hasBeenIssued: val.hasBeenIssued,
      ukefFacilityId: val.ukefFacilityId,
      facilityId: val.facilityId,
      facilityValue: `${val.currency} ${formattedNumber(val.facilityValue)}`,
      currency: val.currency,
    });
  });

  return { tfmFacilities: facilities };
};
