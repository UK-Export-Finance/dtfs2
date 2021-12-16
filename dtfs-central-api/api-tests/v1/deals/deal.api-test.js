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

      expect(status).toEqual(200);

      const { body: createdDeal } = await api.get(`/v1/portal/deals/${body._id}`);

      expect(createdDeal.deal).toEqual(expectAddedFields(newDeal));

      expect(createdDeal.deal.details.maker).toEqual(mockUser);
      expect(createdDeal.deal.details.owningBank).toEqual(mockUser.bank);
      expect(createdDeal.deal.eligibility.status).toEqual(newDeal.eligibility.status);
      expect(createdDeal.deal.eligibility.criteria).toEqual(newDeal.eligibility.criteria);
      expect(createdDeal.deal.facilities).toEqual([]);
    });

    it('creates incremental integer deal IDs', async () => {
      const deal1 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal2 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const deal3 = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      expect(parseInt(deal1.body._id, 10).toString()).toEqual(deal1.body._id);
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

        const { status } = await api.post({ deal: postBody }).to('/v1/portal/deals');

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
      const { body: createdDeal1 } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const { body: createdDeal2 } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const { body: createdDeal3 } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      // create some facilities
      const mockFacility = {
        dealId: createdDeal1._id,
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

      const { body: createdBond1 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
      const { body: createdBond2 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
      const { body: createdLoan1 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');
      const { body: createdLoan2 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

      const { body: bond1 } = await api.get(`/v1/portal/facilities/${createdBond1._id}`);
      const { body: bond2 } = await api.get(`/v1/portal/facilities/${createdBond2._id}`);
      const { body: loan1 } = await api.get(`/v1/portal/facilities/${createdLoan1._id}`);
      const { body: loan2 } = await api.get(`/v1/portal/facilities/${createdLoan2._id}`);

      const { body: deal1 } = await api.get(`/v1/portal/deals/${createdDeal1._id}`);
      const { body: deal2 } = await api.get(`/v1/portal/deals/${createdDeal2._id}`);
      const { body: deal3 } = await api.get(`/v1/portal/deals/${createdDeal3._id}`);

      const { status, body } = await api.post().to('/v1/portal/deals/query');

      expect(status).toEqual(200);
      expect(body.count).toEqual(3);

      const deal1InBody = body.deals.filter((deal) => deal._id === createdDeal1._id);
      const deal2InBody = body.deals.filter((deal) => deal._id === createdDeal2._id);
      const deal3InBody = body.deals.filter((deal) => deal._id === createdDeal3._id);

      expect(deal1InBody.length).toEqual(1);
      expect(deal2InBody.length).toEqual(1);
      expect(deal3InBody.length).toEqual(1);
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

    describe('when a BSS deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
        const dealId = postResult.body._id;

        // create some facilities
        const mockFacility = {
          dealId,
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

        const { body: createdBond1 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdBond2 } = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdLoan1 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');
        const { body: createdLoan2 } = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

        const { body: bond1 } = await api.get(`/v1/portal/facilities/${createdBond1._id}`);
        const { body: bond2 } = await api.get(`/v1/portal/facilities/${createdBond2._id}`);
        const { body: loan1 } = await api.get(`/v1/portal/facilities/${createdLoan1._id}`);
        const { body: loan2 } = await api.get(`/v1/portal/facilities/${createdLoan2._id}`);

        const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

        expect(status).toEqual(200);
        expect(body.deal.bondTransactions.items).toEqual([
          bond1,
          bond2,
        ]);

        expect(body.deal.loanTransactions.items).toEqual([
          loan1,
          loan2,
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
          ...newDeal.details,
          bankSupplyContractName: 'change this field',
        },
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
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
        eligibility: {
          mockNewField: true,
        },
      };

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...newDeal.details,
          bankSupplyContractName: 'change this field',
        },
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
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
          ...newDeal.details,
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
          ...newDeal.details,
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
      expect(typeof body.updatedAt).toEqual('number');
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
