const facilityReducer = require('../reducers/facility');
const { findOneFacility } = require('../../v1/controllers/facility.controller');
const { findOneTfmDeal } = require('../../v1/controllers/deal.controller');
const isGefFacility = require('../helpers/isGefFacility');

require('dotenv').config();

const queryFacility = async ({ _id }) => {
  const facility = await findOneFacility(_id);

  const { facilitySnapshot } = facility;

  let dealId;

  if (isGefFacility(facilitySnapshot.type)) {
    dealId = facilitySnapshot.dealId;
  } else {
    dealId = facilitySnapshot.dealId;
  }

  const deal = await findOneTfmDeal(dealId);

  const { dealSnapshot, tfm: dealTfm } = deal;

  return facilityReducer(facility, dealSnapshot, dealTfm);
};

module.exports = queryFacility;
