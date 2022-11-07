const api = require('./api');

const ECs = require('./fixtures/eligibilityCriteria');

module.exports.initialise = async (app, user) => {
  const { get, post, remove } = api(app).as(user);

  const currentECResponse = await get('/v1/eligibility-criteria');
  const existingECs = currentECResponse.body;
  existingECs.map((existingEC) => remove(`/v1/users/${existingEC._id}`));

  ECs.forEach((ec) => post(ec).to('/v1/eligibility-criteria/'));
};
