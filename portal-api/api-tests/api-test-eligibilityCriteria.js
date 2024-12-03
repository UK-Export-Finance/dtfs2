const api = require('./api');

const ECs = require('./fixtures/eligibilityCriteria');

let notYetInitialised = true;

module.exports.initialise = async (app, user) => {
  if (notYetInitialised) {
    const { get, post, remove } = api(app).as(user);

    const currentECResponse = await get('/v1/eligibility-criteria');
    const existingECs = currentECResponse.body.eligibilityCriteria;

    for (const existingEC of existingECs) {
      await remove(`/v1/eligibility-criteria/${existingEC._id}`);
    }

    for (const ec of ECs) {
      await post(ec).to('/v1/eligibility-criteria/');
    }

    notYetInitialised = false;
  }
};
