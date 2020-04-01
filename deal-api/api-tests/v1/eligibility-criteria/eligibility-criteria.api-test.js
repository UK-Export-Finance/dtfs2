const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

// const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const getToken = require('../../getToken')(app);

describe('/v1/deals/:id/eligibility-criteria', () => {
  const newDeal = aDeal({ supplyContractName: 'Original Value' });

  const updatedECPartial = {
    'criterion-11': 'true',
    'criterion-12': 'true',
    'criterion-14': 'false',
  };

  const updatedECCompleted = {
    'criterion-11': 'true',
    'criterion-12': 'true',
    'criterion-13': 'true',
    'criterion-14': 'true',
    'criterion-15': 'false',
    'criterion-16': 'true',
    'criterion-17': 'true',
    'criterion-18': 'true',
  };

  let aTokenWithNoRoles;
  let aTokenWithMakerRole;

  beforeEach(async () => {
    await wipeDB();

    aTokenWithNoRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });
    aTokenWithMakerRole = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
    });
  });

  describe('PUT /v1/deals/:id/eligibility-criteria', () => {
    it('updates all the eligibility criteria without validation error', async () => {
      const postResult = await post(newDeal, aTokenWithMakerRole).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await put(updatedECCompleted, aTokenWithMakerRole).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(0);
    });

    it('updates some of the eligibility criteria and generates validation errors', async () => {
      const postResult = await post(newDeal, aTokenWithMakerRole).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await put(updatedECPartial, aTokenWithMakerRole).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(5);
      expect(Object.keys(body.eligibility.validationErrors.errorList)).toEqual(['13', '15', '16', '17', '18']);
    });
  });
});
