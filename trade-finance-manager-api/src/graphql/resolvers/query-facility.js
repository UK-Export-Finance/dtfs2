const facilityReducer = require('../reducers/facility');
const { findOneFacility } = require('../../v1/controllers/facility.controller');
const { findOneTfmDeal } = require('../../v1/controllers/deal.controller');

exports.queryFacility = async ({ _id }) => {
  const facility = await findOneFacility(_id);

  const { facilitySnapshot } = facility;

  const { dealId } = facilitySnapshot;

  const deal = await findOneTfmDeal(dealId);

  const { dealSnapshot, tfm: dealTfm } = deal;

  return facilityReducer(facility, dealSnapshot, dealTfm);
};
