// temporarily map facilities as they are for initial dev
// TODO: generic facility structure for all facilities (cash, contingent, bonds, loans)

const mapBssEwcsFacility = (facility) => {
  const {
    _id,
    ukefFacilityID,
    facilityType,
    facilityValue,
    currency,
    coveredPercentage,
    ukefExposure,
    ukefGuaranteeInMonths,
    previousFacilityStage,
    hasBeenAcknowledged,
    facilityStage,
    requestedCoverStartDate,
    // TODO are these in gef facility?
    dayCountBasis,
    guaranteeFeePayableByBank,
    feeType,
    premiumType,
    feeFrequency,
    premiumFrequency,
  } = facility;

  return {
    _id,
    ukefFacilityID,
    facilityType,
    currency,
    value: facilityValue,
    coverPercentage: coveredPercentage,
    ukefExposure,
    coverStartDate: requestedCoverStartDate,
    ukefGuaranteeInMonths,

    facilityStage, // change to hasBeenIssued
    previousFacilityStage, // maybe dont need this and check can just be "is issued and not acknowledge"
    hasBeenAcknowledged,

    'coverEndDate-year': facility['coverEndDate-year'],
    'coverEndDate-month': facility['coverEndDate-month'],
    'coverEndDate-day': facility['coverEndDate-day'],
    // ^ used in:
    // - getGuaranteeDates
    // - getFacilityExposurePeriod

    guaranteeFeePayableByBank,
    dayCountBasis,
    feeFrequency,
    premiumFrequency,
    feeType,
    premiumType,
    tfm: facility.tfm,
  };
};


module.exports = mapBssEwcsFacility;
