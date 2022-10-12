const Chance = require('chance');

const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { expectAddedFields, expectAddedFieldsWithEditedBy } = require('./expectAddedFields');
const { MOCK_BSS_DEAL, MOCK_USER } = require('../mocks/mock-data');
const CONSTANTS = require('../../../src/constants');

const chance = new Chance();

const mockUserNoBank = {
  _id: chance.integer(),
  username: chance.word(),
  roles: [],
};

const newDeal = aDeal({
  ...MOCK_BSS_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: chance.company(),
  },
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: chance.integer(),
});

describe('/v1/portal/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
  });

  describe('POST /v1/portal/deals', () => {
    it('returns the created deal with correct fields', async () => {
      const { body, status } = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');

      expect(status).toEqual(200);

      const { body: createdDeal } = await api.get(`/v1/portal/deals/${body._id}`);

      expect(createdDeal.deal).toEqual(expectAddedFields(newDeal));

      expect(createdDeal.deal.maker).toEqual(MOCK_USER);
      expect(createdDeal.deal.bank).toEqual(MOCK_USER.bank);
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
          bankInternalRefName: chance.word(),
          additionalRefName: chance.word(),
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

        const { body, status } = await api.post({ deal: postBody, user: MOCK_USER }).to('/v1/portal/deals');

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
          _id: chance.integer(),
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
    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(newDeal));
    });

    describe('when a BSS deal has facilities', () => {
      it('returns facilities mapped to deal.bondTransactions and deal.loanTransactions', async () => {
        const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
        const dealId = postResult.body._id;

        // create some facilities
        const mockFacility = {
          dealId,
          value: 123456,
          user: MOCK_USER,
        };

        const mockBond = {
          type: 'Bond',
          ...mockFacility,
        };

        const mockLoan = {
          type: 'Loan',
          ...mockFacility,
        };

        const { body: createdBond1 } = await api.post({ facility: mockBond, user: MOCK_USER }).to('/v1/portal/facilities');
        const { body: createdBond2 } = await api.post({ facility: mockBond, user: MOCK_USER }).to('/v1/portal/facilities');
        const { body: createdLoan1 } = await api.post({ facility: mockLoan, user: MOCK_USER }).to('/v1/portal/facilities');
        const { body: createdLoan2 } = await api.post({ facility: mockLoan, user: MOCK_USER }).to('/v1/portal/facilities');

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
    it('returns the updated deal', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: chance.word(),
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const { status, body } = await api.put({ dealUpdate: updatedDeal, user: MOCK_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, MOCK_USER));
    });

    it('handles partial updates', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const refName = chance.word();

      const partialUpdate = {
        additionalRefName: refName,
        eligibility: {
          mockNewField: true,
        },
      };

      const expectedDataIncludingUpdate = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: refName,
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const { status: putStatus } = await api.put({ dealUpdate: partialUpdate, user: MOCK_USER }).to(`/v1/portal/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(expectedDataIncludingUpdate, MOCK_USER));
    });

    it('updates the deal', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;

      const updatedDeal = {
        ...newDeal,
        _id: createdDeal._id,
        additionalRefName: chance.word(),
      };

      await api.put({ dealUpdate: updatedDeal, user: MOCK_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const { status, body } = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal).toEqual(expectAddedFieldsWithEditedBy(updatedDeal, MOCK_USER));
    });

    it('adds updates and retains `editedBy` array with user data', async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const firstUpdate = {
        ...createdDeal,
        additionalRefName: chance.word(),
      };

      await api.put({ dealUpdate: firstUpdate, user: MOCK_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        additionalRefName: chance.word(),
      };

      await api.put({ dealUpdate: secondUpdate, user: MOCK_USER }).to(`/v1/portal/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await api.get(`/v1/portal/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(200);

      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, MOCK_USER, 1).editedBy[0]);
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(expectAddedFieldsWithEditedBy(secondUpdate, MOCK_USER, 2).editedBy[1]);
    });
  });

  describe('PUT /v1/portal/deals/:id/status', () => {
    it('Should return 400 bad request status code when the new status is same and existing application status', async () => {
      // Create a new BSS deal
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF,
        previousStatus: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
      };
      const postResult = await api.post({ deal: dealWithSubmittedStatus, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;

      // First status update - 200
      const statusUpdate = CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED;
      const { status } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(status).toEqual(200);

      // Second status update - 400
      const { status: secondStatus } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(secondStatus).toEqual(400);
    });

    it('returns the updated deal with updated statuses', async () => {
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF,
        previousStatus: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
      };

      const postResult = await api.post({ deal: dealWithSubmittedStatus, user: MOCK_USER }).to('/v1/portal/deals');
      const createdDeal = postResult.body;
      const statusUpdate = CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED;

      const { status, body } = await api.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);

      expect(body.status).toEqual(CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
      expect(body.previousStatus).toEqual(CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF);
      expect(body.updatedAt).toBeNumber();
    });
  });

  describe('DELETE /v1/portal/deals/:id', () => {
    it('deletes the deal', async () => {
      const { body } = await api.post({ deal: newDeal, user: MOCK_USER }).to('/v1/portal/deals');

      const deleteResponse = await api.remove({}).to(`/v1/portal/deals/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/portal/deals/${body._id}`);

      expect(status).toEqual(404);
    });
  });
});
