const CONSTANTS = require('../../../../constants');

const mapGefFacilityProvidedOn = (details) =>
  details.map((basis) => {
    // 'Other basis' should not display in TFM UI.
    if (basis !== CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.OTHER.ID) {
      return CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF[basis].TEXT;
    }

    return null;
  });


module.exports = mapGefFacilityProvidedOn;
