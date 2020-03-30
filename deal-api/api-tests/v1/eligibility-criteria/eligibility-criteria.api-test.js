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
  const updatedDeal = aDeal({ supplyContractName: 'Updated Value' });

  const updatedEC = {
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
    it('updates the eligibility criteria', async () => {
      const postResult = await post(newDeal, aTokenWithMakerRole).to('/v1/deals');
      const newId = postResult.body._id;

      await put(updatedEC, aTokenWithMakerRole).to(`/v1/deals/${newId}/eligibility-criteria`);

      const { status, body } = await get(
        `/v1/deals/${newId}`,
        aTokenWithMakerRole,
      );

      expect(status).toEqual(200);
      //      expect(body.eligibilityCriteria).toEqual(expectAddedFields(updatedEC));
    });
  });
});
