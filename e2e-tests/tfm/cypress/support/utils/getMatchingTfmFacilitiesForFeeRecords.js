const getMatchingTfmFacility = (feeRecord) => ({
  facilitySnapshot: {
    ukefFacilityId: feeRecord.facilityId,
    coverPercentage: 85,
    value: 200000,
  },
});

export const getMatchingTfmFacilitiesForFeeRecords = (feeRecords) => {
  return feeRecords.map((feeRecord) => getMatchingTfmFacility(feeRecord));
};
