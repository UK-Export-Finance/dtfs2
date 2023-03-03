const { updateTfmParty } = require('../../v1/controllers/deal.controller');

const updateParties = async ({ _id, partyUpdate }) => {
  console.log('===2', _id, partyUpdate);
  const update = await updateTfmParty(_id, partyUpdate);
  return update;
};

module.exports = updateParties;
