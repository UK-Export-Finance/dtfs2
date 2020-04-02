const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const {
  get, post, put, remove,
} = require('../../api')(app);

const { expectAddedFields } = require('../deals/expectAddedFields');

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

  let aUserWithoutRoles;
  let user1;
  let user2;
  let superuser;

  beforeEach(async () => {
    await wipeDB();

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    user1 = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Mammon',
      },
    });

    user2 = await getToken({
      username: '5',
      password: '6',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Temple of cash',
      },
    });

    superuser = await getToken({
      username: '7',
      password: '8',
      roles: ['maker'],
      bank: {
        id: '*',
      },
    });
  });

  describe('PUT /v1/deals/:id/eligibility-criteria', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put(updatedECPartial).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(updatedECPartial, aUserWithoutRoles).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status } = await put(updatedECPartial, user2).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await put(updatedECPartial, user1).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status } = await put(updatedECPartial, superuser).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
    });

    it('updates the eligibility criteria', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      await put(updatedECPartial, user1).to(`/v1/deals/${newId}/eligibility-criteria`);

      const { status, body } = await get(
        `/v1/deals/${newId}`,
        user1,
      );

      expect(status).toEqual(200);
      //
      //
      // Expected: {"criterion-11": "true", "criterion-12": "true", "criterion-13": "true", "criterion-14": "true", "criterion-15": "false", "criterion-16": "true", "criterion-17": "true", "criterion-18": "true"}
      // Received: [{"answer": true, "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.", "id": 11}, {"answer": true, "description": "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.", "id": 12}, {"answer": true, "description": "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).", "id": 13}, {"answer": true, "description": "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.", "id": 14}, {"answer": false, "description": "The Requested Cover Start Date is no more than three months from the date of submission.", "id": 15}, {"answer": true, "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.", "id": 16}, {"answer": true, "description": "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.", "id": 17}, {"answer": true, "description": "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.", "id": 18}]
      //
      // expect(body.eligibility.criteria).toEqual(updatedEC);
    });

    it('updates all the eligibility criteria without validation error', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await put(updatedECCompleted, user1).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(0);
    });

    it('updates some of the eligibility criteria and generates validation errors', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await put(updatedECPartial, user1).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(5);

      const errorIdList = [];
      Object.entries(body.eligibility.validationErrors.errorList).forEach(([key, value]) => {
        if (value.text) {
          errorIdList.push(key);
        }
      });
      expect(errorIdList).toEqual(['13', '15', '16', '17', '18']);
    });
  });
});
