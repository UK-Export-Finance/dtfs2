const facilityReducer = require('../reducers/facility');
const { findOneFacility } = require('../../v1/controllers/facility.controller');
const { findOneDeal } = require('../../v1/controllers/deal.controller');

require('dotenv').config();

const queryFacility = async ({ _id }) => {
  const facility = await findOneFacility(_id);

  const { associatedDealId } = facility.facilitySnapshot;

  const deal = await findOneDeal(associatedDealId);

  const { dealSnapshot, tfm: dealTfm } = deal;

  return facilityReducer(facility, dealSnapshot, dealTfm);
};

module.exports = queryFacility;
