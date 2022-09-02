const api = require('./api');

const ECs = require('./fixtures/eligibilityCriteria');

module.exports.initialise = async (app, user) => {
  let notYetInitialised = true;
  if (notYetInitialised) {
    const { get, post, remove } = api(app).as(user);

    const currentECResponse = await get('/v1/eligibility-criteria');
    const existingECs = currentECResponse.body.eligibilityCriteria;

    existingECs.map(async (existingEC) => remove(`/v1/users/${existingEC._id}`));

    ECs.map(async (ec) => post(ec).to('/v1/eligibility-criteria/'));

    notYetInitialised = false;
  }
};
