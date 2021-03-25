const facilityReducer = require('../reducers/facility');
const { findOneFacility } = require('../../v1/controllers/facility.controller');
const { findOneDeal } = require('../../v1/controllers/deal.controller');

require('dotenv').config();

const queryFacility = async ({ _id }) => {
  const facility = await findOneFacility(_id);

  const { associatedDealId } = facility.facilitySnapshot;

  const deal = await findOneDeal(associatedDealId);

  const dealDetails = deal.dealSnapshot.details;
  const dealTfm = deal.tfm;

  // issue is, mock api in api tests is not returning deal.tfm
  return facilityReducer(facility, dealDetails, dealTfm);
};

module.exports = queryFacility;
