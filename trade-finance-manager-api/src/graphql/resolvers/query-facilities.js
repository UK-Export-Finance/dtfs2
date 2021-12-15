const { getAllFacilities } = require('../../v1/controllers/facility.controller');
const { formattedNumber } = require('../../utils/number');
// list all facilities from the database
exports.queryAllFacilities = async () => {
  const allFacilities = await getAllFacilities();

  const facilities = [];
  allFacilities.forEach((facility) => {
    facilities.push({
      applicationId: facility.applicationId,
      companyName: facility.companyName,
      coverEndDate: facility.coverEndDate,
      dealType: facility.dealType,
      facilityType: facility.facilityType,
      hasBeenIssued: facility.hasBeenIssued,
      ukefFacilityId: facility.ukefFacilityId,
      facilityId: facility.facilityId,
      facilityValue: `${facility.currency} ${formattedNumber(facility.facilityValue)}`,
      currency: facility.currency,
    });
  });

  return { tfmFacilities: facilities };
};
