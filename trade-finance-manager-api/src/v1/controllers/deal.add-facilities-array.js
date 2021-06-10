const api = require('../api');
const CONSTANTS = require('../../constants');

const mapFacilityProductCode = (facilityType) => {
  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    return CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;
  }

  if (facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
    return CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;
  }

  return null;
};

const mapFacilitiesArray = (facilities) => facilities.map((facility) => {
  const {
    _id, // eslint-disable-line no-underscore-dangle
    facilityType,
  } = facility;

  return {
    _id,
    facilityType,
    productCode: mapFacilityProductCode(facilityType),
  };
});

const addFacilitiesArray = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    tfm,
    dealSnapshot,
  } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
  } = dealSnapshot;

  const allFacilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const mappedFacilitiesArray = mapFacilitiesArray(allFacilities);

  const dealUpdate = {
    tfm: {
      ...tfm,
      facilities: mappedFacilitiesArray,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    dealSnapshot,
    tfm: updatedDeal.tfm,
  };
};


module.exports = {
  mapFacilityProductCode,
  mapFacilitiesArray,
  addFacilitiesArray,
};
