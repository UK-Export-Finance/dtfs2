import { FacilityDashboard, FACILITY_STAGE } from '@ukef/dtfs2-common';
import { cloneDeep } from 'lodash';

/**
 * Maps the facility stage of a given facility based on its issuance status.
 *
 * @param {FacilityDashboard} facility - The facility object to map.
 * @returns {FacilityDashboard} The facility object with the mapped facility stage.
 */
const mapFacilityStage = (facility: FacilityDashboard): FacilityDashboard => {
  const mappedFacility = cloneDeep(facility);

  if (facility.facilityStage !== FACILITY_STAGE.RISK_EXPIRED) {
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
