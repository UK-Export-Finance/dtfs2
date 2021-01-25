const db = require('../../../../drivers/db-client');
const { findOneFacility } = require('../../portal/facility/get-facility.controller');

const transferSubmittedFacility = async (dealId) => {
  const submittedFacility = await findOneFacility(dealId);
  const collection = await db.getCollection('tfm-facilties');
  const response = await collection.insertOne(submittedFacility);

  const createdFacility = response.ops[0];

  return {
    facility: createdFacility,
  };
};
exports.transferSubmittedFacility = transferSubmittedFacility;
