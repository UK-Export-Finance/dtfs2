const { generateFacilitiesListString } = require('../../helpers/notify-template-formatters');
const getFacilitiesByType = require('../../helpers/get-facilities-by-type');

const bssEmailVariables = (deal) => {
  const { facilities } = deal;

  const { bonds, loans } = getFacilitiesByType(facilities);
  const bssList = generateFacilitiesListString(bonds);
  const ewcsList = generateFacilitiesListString(loans);

  const facilityLists = { bssList, ewcsList };

  const emailVariables = {
    bssList: facilityLists.bssList,
    ewcsList: facilityLists.ewcsList,
  };

  return emailVariables;
};

module.exports = bssEmailVariables;
