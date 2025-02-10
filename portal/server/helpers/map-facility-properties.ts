import { FacilityDashboard, FACILITY_STAGE } from '@ukef/dtfs2-common';

/**
 * Maps the facility stage based on the current facility properties.
 *
 * @param {Facility} facility - The facility object to map the stage for.
 * @returns {Facility} The facility object with the mapped stage.
 *
 * The function checks the `facilityStage` property of the input `facility`.
 * If the `facilityStage` is `FACILITY_STAGE.RISK_EXPIRED`, it sets the `facilityStage`
 * of the returned facility to `FACILITY_STAGE.RISK_EXPIRED`.
 * Otherwise, it sets the `facilityStage` based on the `hasBeenIssued` property:
 * - If `hasBeenIssued` is `true`, it sets the `facilityStage` to `FACILITY_STAGE.ISSUED`.
 * - If `hasBeenIssued` is `false`, it sets the `facilityStage` to `FACILITY_STAGE.UNISSUED`.
 */
const mapFacilityStage = (facility: FacilityDashboard): FacilityDashboard => {
  const mappedFacility = facility;

  if (facility.facilityStage === FACILITY_STAGE.RISK_EXPIRED) {
    mappedFacility.facilityStage = FACILITY_STAGE.RISK_EXPIRED;
  } else {
    mappedFacility.facilityStage = facility.hasBeenIssued ? FACILITY_STAGE.ISSUED : FACILITY_STAGE.UNISSUED;
  }

  return mappedFacility;
};

// Mapper accumulator
const mappings = [mapFacilityStage];

/**
 * Maps the properties of an array of facilities using a series of mapping functions.
 *
 * @param {Facility[]} facilities - The array of facilities to be mapped.
 * @returns {Facility[]} The array of facilities with mapped properties.
 */
export const mapFacilityProperties = (facilities: FacilityDashboard[]): FacilityDashboard[] =>
  facilities.map((facility) => mappings.reduce((mappedFacilities, mapper) => mapper(mappedFacilities), facility));
