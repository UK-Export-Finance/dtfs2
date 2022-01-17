const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { expectAddedFields, expectAddedFieldsWithEditedBy } = require('./expectAddedFields');
const CONSTANTS = require('../../../src/constants');
const { MOCK_DEAL } = require('../mocks/mock-data');

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
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
  bankInternalRefName: 'test',
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: 123456789,
});

describe('/v1/portal/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('GET /v1/portal/deals', () => {
    it('should return count and mapped deals', async () => {
      await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      const { status, body } = await api.get('/v1/portal/deals');

      expect(status).toEqual(200);

      expect(typeof body[0].count).toEqual('number');

      const firstDeal = body[0].deals[0];

      expect(typeof firstDeal._id).toEqual('string');
      expect(firstDeal.bankInternalRefName).toEqual(newDeal.bankInternalRefName);
      expect(firstDeal.status).toEqual(newDeal.status);
      expect(firstDeal.product).toEqual(newDeal.dealType);
      expect(firstDeal.submissionType).toEqual(newDeal.submissionType);
      expect(firstDeal.exporter).toEqual(newDeal.exporter.companyName);
      expect(typeof firstDeal.updatedAt).toEqual('number');
    });
  });
  describe('POST /v1/portal/deals', () => {
    it('returns the created deal with correct fields', async () => {
      const { body, status } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');

      expect(status).toEqual(200);

      const { body: createdDeal } = await api.get(`/v1/portal/deals/${body._id}`);

      expect(createdDeal.deal).toEqual(expectAddedFields(newDeal));

      expect(createdDeal.deal.maker).toEqual(mockUser);
      expect(createdDeal.deal.bank).toEqual(mockUser.bank);
      expect(createdDeal.deal.eligibility.status).toEqual(newDeal.eligibility.status);
      expect(createdDeal.deal.eligibility.criteria).toEqual(newDeal.eligibility.criteria);
      expect(createdDeal.deal.facilities).toEqual([]);
    });

    describe('when user is invalid', () => {
      it('missing user returns 404', async () => {
        const postBody = {
          bankInternalRefName: '',
          additionalRefName: '',
        };

        const { status } = await api.post({ deal: postBody }).to('/v1/portal/deals');

        expect(status).toEqual(404);
      });

      it('user with no bank returns validation errors', async () => {
        const postBody = {
          bankInternalRefName: '1234',
          additionalRefName: 'name',
        };

        const { body, status } = await api.post({ deal: postBody, user: mockUserNoBank }).to('/v1/portal/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.maker object with bank is required');
      });
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          bankInternalRefName: '',
          additionalRefName: '',
        };

        const { body, status } = await api.post({ deal: postBody, user: mockUser }).to('/v1/portal/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.bankInternalRefName).toBeDefined();
        expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Enter the Bank deal ID');

        expect(body.validationErrors.errorList.additionalRefName).toBeDefined();
        expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Enter the Bank deal name');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          bankInternalRefName: 'a'.repeat(31),
          additionalRefName: 'b'.repeat(101),
        };
        const invalidMaker = {
          _id: '12345678',
        };

        const { body, status } = await api.post({ deal: postBody, user: invalidMaker }).to('/v1/portal/deals');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);

        expect(body.validationErrors.errorList.bankInternalRefName).toBeDefined();
        expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Bank deal ID must be 30 characters or fewer');

        expect(body.validationErrors.errorList.additionalRefName).toBeDefined();
        expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Bank deal name must be 100 characters or fewer');

        expect(body.validationErrors.errorList.makerObject).toBeDefined();
        expect(body.validationErrors.errorList.makerObject.text).toEqual('deal.maker object with bank is required');
      });
    });
  });

  describe('GET /v1/portal/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get(`/v1/portal/deals/${MOCK_DEAL.DEAL_ID}`);

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
          value: 123456,
          user: mockUser,
        };

        const mockBond = {
          type: 'Bond',
          ...mockFacility,
        };

        const mockLoan = {
          type: 'Loan',
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
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
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
        additionalRefName: 'change this field',
        eligibility: {
          mockNewField: true,
        },
      };

      const expectedDataIncludingUpdate = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
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
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: 'change this field',
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
        additionalRefName: 'change this field',
      };

      await api.put({ dealUpdate: firstUpdate, user: mockUser }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        additionalRefName: 'change this field again',
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

    it('Should return 400 bad request status code when the new status is same and existing application status', async () => {
      // Create a new BSS deal
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: 'Submitted',
        previousStatus: 'Checker\'s approval',
      };
      const postResult = await api.post({ deal: dealWithSubmittedStatus, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;

      // First status update - 200
      let statusUpdate = 'Acknowledged by UKEF';
      const { status } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(status).toEqual(200);

      // Second status update - 400
      statusUpdate = 'Acknowledged by UKEF';
      const { status: secondStatus } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(secondStatus).toEqual(400);
    });

    it('returns the updated deal with updated statuses', async () => {
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: 'Submitted',
        previousStatus: 'Checker\'s approval',
      };

      const postResult = await api.post({ deal: dealWithSubmittedStatus, user: mockUser }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const statusUpdate = 'Acknowledged by UKEF';

      const { status, body } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);

      expect(body.status).toEqual('Acknowledged by UKEF');
      expect(body.previousStatus).toEqual('Submitted');
      expect(typeof body.updatedAt).toEqual('number');
    });
  });

  describe('DELETE /v1/portal/deals/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove({}).to(`/v1/portal/deals/${MOCK_DEAL.DEAL_ID}`);

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
