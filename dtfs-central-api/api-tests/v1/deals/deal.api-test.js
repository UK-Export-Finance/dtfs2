const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

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

const mockUserNoBank = {
  _id: '123456789',
  username: 'temp',
  roles: [],
};

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/portal/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('POST /v1/portal/deals', () => {
    it('returns the created deal with correct fields', async () => {
      const { body, status } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      expect(true).toEqual(false);
      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));

      expect(body.details.maker).toEqual(mockUser);
      expect(body.details.owningBank).toEqual(mockUser.bank);
      expect(body.eligibility.status).toEqual(newDeal.eligibility.status);
      expect(body.eligibility.criteria).toEqual(newDeal.eligibility.criteria);
      expect(body.facilities).toEqual([]);
    });

    it('creates incremental integer deal IDs', async () => {
      const deal1 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal2 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal3 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      expect(parseInt(deal1.body._id).toString()).toEqual(deal1.body._id);
      expect(deal2.body._id - deal1.body._id).toEqual(1);
      expect(deal3.body._id - deal2.body._id).toEqual(1);
    });

    describe('when user is invalid', () => {
      it('missing user returns 404', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
          },
        };

        const { body, status } = await api.post({ deal: postBody }).to('/v1/portal/deals');

        expect(status).toEqual(404);
      });

      it('user with no bank returns validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '1234',
            bankSupplyContractName: 'name',
          },
        };

        const { body, status } = await api.post({ deal: postBody, user: mockUserNoBank }).to('/v1/portal/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.details.maker object with bank is required');
      });
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
          },
        };

        const { body, status } = await api.post({ deal: postBody, user: mockUser }).to('/v1/portal/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Enter the Bank deal ID');

        expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Enter the Bank deal name');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: 'a'.repeat(31),
            bankSupplyContractName: 'b'.repeat(101),
          },
        };
        const invalidMaker = {
          _id: '12345678',
        };

        const { body, status } = await api.post({ deal: postBody, user: invalidMaker }).to('/v1/portal/deals');

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

  describe('POST /v1/portal/deals/query', () => {
    it('returns multiple deals with count', async () => {
      await wipeDB.wipe(['deals']);
      const deal1 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal2 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal3 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      const { status, body } = await api.post().to('/v1/portal/deals/query');

      expect(status).toEqual(200);
      expect(body.count).toEqual(3);
      expect(body.deals).toEqual([
        deal3.body,
        deal2.body,
        deal1.body,
      ]);
    });
  });

  describe('GET /v1/portal/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/portal/deals/12345678910');

      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(newDeal));
    });

    describe('when a deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
        const dealId = postResult.body._id;

        // create some facilities
        const mockFacility = {
          associatedDealId: dealId,
          facilityValue: 123456,
          user: mockUser,
        };

        const mockBond = {
          facilityType: 'bond',
          ...mockFacility,
        };

        const mockLoan = {
          facilityType: 'loan',
          ...mockFacility,
        };

        const createdBond1 = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const createdBond2 = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const createdLoan1 = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');
        const createdLoan2 = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

        const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

        expect(status).toEqual(200);
        expect(body.deal.bondTransactions.items).toEqual([
          createdBond1.body,
          createdBond2.body,
        ]);

        expect(body.deal.loanTransactions.items).toEqual([
          createdLoan1.body,
          createdLoan2.body,
        ]);
      });
    });
  });

  describe('PUT /v1/portal/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put({ dealUpdate: newDeal, user: mockUser }).to('/v1/portal/deals/123456789012');

      expect(status).toEqual(404);
    });

    it('returns the updated deal', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status, body } = await api.put({ dealUpdate: updatedDeal, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, mockUser));
    });

    it('handles partial updates', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;

      const partialUpdate = {
        details: {
          bankSupplyContractName: 'change this field',
        },
      };

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status: putStatus } = await api.put({ dealUpdate: partialUpdate, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(expectedDataIncludingUpdate, mockUser));
    });

    it('updates the deal', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;

      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      await api.put({ dealUpdate: updatedDeal, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, mockUser));
    });

    it('adds updates and retains `editedBy` array with user data', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const firstUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      await api.put({ dealUpdate: firstUpdate, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        details: {
          ...dealAfterFirstUpdate.body.deal.details,
          bankSupplyContractName: 'change this field again',
        },
      };

      await api.put({ dealUpdate: secondUpdate, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(200);

      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, mockUser, 1).editedBy[0]);
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, mockUser, 2).editedBy[1]);
    });
  });

  describe('PUT /v1/portal/deals/:id/status', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put({ dealUpdate: newDeal, user: mockUser }).to('/v1/portal/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('returns the updated deal with updated statuses', async () => {
      const dealWithSubmittedStatus = {
        ...newDeal,
        details: {
          ...newDeal.details,
          status: 'Submitted',
          previousStatus: 'Checker\'s approval',
        },
      };

      const postResult = await api.post({ deal: dealWithSubmittedStatus, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const statusUpdate = 'Acknowledged by UKEF';

      const { status, body } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);

      expect(body.details.status).toEqual('Acknowledged by UKEF');
      expect(body.details.previousStatus).toEqual('Submitted');
      expect(typeof body.details.dateOfLastAction).toEqual('string');
    });
  });

  describe('DELETE /v1/portal/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove({}).to('/v1/portal/deals/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the deal', async () => {
      const { body } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      const deleteResponse = await api.remove({}).to(`/v1/portal/deals/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/portal/deals/${body._id}`);

      expect(status).toEqual(404);
    });
  });
});
