const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { expectAddedFields, expectAddedFieldsWithEditedBy } = require('./expectAddedFields');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    maker: mockUser,
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [ {} ],
  }
});

describe('/v1/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('POST /v1/deals', () => {
    it('returns the created deal with correct fields', async () => {
      const { body, status } = await api.post(newDeal).to('/v1/deals');

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));

      expect(body.details.maker).toEqual(newDeal.details.maker);
      expect(body.details.owningBank).toEqual(newDeal.details.maker.bank);
      expect(body.eligibility.status).toEqual(newDeal.eligibility.status);
      expect(body.eligibility.criteria).toEqual(newDeal.eligibility.criteria);
    });

    it('creates incremental integer deal IDs', async () => {
      const deal1 = await api.post(newDeal).to('/v1/deals');
      const deal2 = await api.post(newDeal).to('/v1/deals');
      const deal3 = await api.post(newDeal).to('/v1/deals');

      expect(parseInt(deal1.body._id).toString()).toEqual(deal1.body._id);
      expect(deal2.body._id - deal1.body._id).toEqual(1);
      expect(deal3.body._id - deal2.body._id).toEqual(1);
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
          },
        };

        const { body, status } = await api.post(postBody).to('/v1/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);

        expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Enter the Bank deal ID');

        expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Enter the Bank deal name');

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.details.maker object with bank is required');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: 'a'.repeat(31),
            bankSupplyContractName: 'b'.repeat(101),
          },
          maker: {
            _id: '12345678'
          }
        };

        const { body, status } = await api.post(postBody).to('/v1/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);

        expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Bank deal ID must be 30 characters or fewer');

        expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Bank deal name must be 100 characters or fewer');

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.details.maker object with bank is required');
      });
    });
  });

  describe('GET /v1/deals/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(newDeal));
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/deals/12345678910');

      expect(status).toEqual(404);
    });
  });

  describe('PUT /v1/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(404);
    });

    it('returns the updated deal', async () => {
      const postResult = await api.post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
        user: mockUser,
      };

      const { status, body } = await api.put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      delete updatedDeal.user;
      expect(body).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, mockUser));
    });

    it('handles partial updates', async () => {
      const postResult = await api.post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const partialUpdate = {
        details: {
          bankSupplyContractName: 'change this field',
        },
        user: mockUser,
      };

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status: putStatus } = await api.put(partialUpdate).to(`/v1/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(expectedDataIncludingUpdate, mockUser));
    });

    it('updates the deal', async () => {
      const postResult = await api.post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
        user: mockUser,
      };

      await api.put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await api.get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      
      delete updatedDeal.user;
      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, mockUser));
    });

    it('adds updates and retains `editedBy` array with req.user data', async () => {
      const postResult = await api.post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const firstUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
        user: mockUser,
      };

      await api.put(firstUpdate).to(`/v1/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await api.get(`/v1/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        details: {
          ...dealAfterFirstUpdate.body.deal.details,
          bankSupplyContractName: 'change this field again',
        },
        user: mockUser,
      };

      await api.put(secondUpdate).to(`/v1/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await api.get(`/v1/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(200);

      delete secondUpdate.user;

      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, mockUser, 1).editedBy[0]);
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, mockUser, 2).editedBy[1]);
    });
  });

  describe('DELETE /v1/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove('/v1/deals/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the deal', async () => {
      const { body } = await api.post(newDeal).to('/v1/deals');

      const deleteResponse = await api.remove(`/v1/deals/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/deals/${body._id}`);

      expect(status).toEqual(404);
    });
  });
});
