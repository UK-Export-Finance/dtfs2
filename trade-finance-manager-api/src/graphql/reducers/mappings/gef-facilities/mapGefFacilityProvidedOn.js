const CONSTANTS = require('../../../../constants');

const mapGefFacilityProvidedOn = (details) =>
  details.reduce((previousValue, currentValue) => {
    // 'Other basis' should not display in TFM UI.
    if (currentValue !== CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF.OTHER.ID) {
      previousValue.push(CONSTANTS.FACILITIES.FACILITY_PROVIDED_ON_GEF[currentValue].TEXT);
    }

    return previousValue;
  }, []);


module.exports = mapGefFacilityProvidedOn;
