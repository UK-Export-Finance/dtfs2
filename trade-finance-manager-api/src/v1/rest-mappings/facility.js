const mapFacilitySnapshot = require('./mappings/facilities/mapFacilitySnapshot');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacilitySnapshot = require('./mappings/gef-facilities/mapGefFacilitySnapshot');
const isGefFacility = require('./helpers/isGefFacility');

/**
 * Maps a facility database object to a facility type throughout TFM-API and TFM-UI.
 * The mappings include creating a facility snapshot that represents the current facility, with all amendments and tfm changes applied.
 * @param {import('@ukef/dtfs2-common').TfmFacility} facility the full facility object from the database
 * @param {import('@ukef/dtfs2-common').Deal} dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @param {import('@ukef/dtfs2-common').DealTfmObject} dealTfm the deal.dealTfm object from the database corresponding to the facility
 * @returns {import('@ukef/dtfs2-common').MappedFacility} mapped facility object
 */
const facilityMapper = (facility, dealSnapshot, dealTfm) => {
  const facilityType = facility.facilitySnapshot.type;
  const isGef = isGefFacility(facilityType);

  const mappedFacilitySnapshot = isGef
    ? mapGefFacilitySnapshot(facility, /** @type {import('@ukef/dtfs2-common').GefDeal} */ dealSnapshot)
    : mapFacilitySnapshot(facility, /** @type {import('@ukef/dtfs2-common').BssEwcsDeal} */ dealSnapshot);

  return {
    _id: facility._id,
    facilitySnapshot: mappedFacilitySnapshot,
    tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
  };
};

module.exports = facilityMapper;
