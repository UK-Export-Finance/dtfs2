const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const incompleteDeal = require('../../fixtures/deal-with-incomplete-about-section.json');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');
const smeTypeIsRequired = require('../../../src/v1/validation/submission-details-rules/sme-type-is-required');
const facilityValue = require('../../../src/v1/validation/fields/facility-value');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

// jest.unmock('@azure/storage-file-share');

describe('/v1/deals/:id/status', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles('maker', 'checker').withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('GET /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text } = await as(anHSBCMaker).get(`/v1/deals/${newId}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual("Ready for Checker's approval");
    });
  });

  describe('PUT /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status } = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('returns the updated status', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);
      expect(body.details.status).toEqual('Abandoned Deal');
    });

    it('updates the deal', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.details.status).toEqual('Abandoned Deal');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.details.dateOfLastAction).not.toEqual(completedDeal.details.dateOfLastAction);
    });

    it('updates details.previousWorkflowStatus only when relevant workflow status changed', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.previousWorkflowStatus).toEqual('Draft');
    });

    it('adds the comment to the existing comments', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.comments[0]).toEqual({
        text: 'Flee!',
        timestamp: expect.any(String),
        user: {
          _id: expect.any(String),
          bank: anHSBCMaker.bank,
          roles: anHSBCMaker.roles,
          lastLogin: expect.any(String),
          username: anHSBCMaker.username,
          email: anHSBCMaker.email,
          firstname: anHSBCMaker.firstname,
          surname: anHSBCMaker.surname,
          timezone: 'Europe/London',
          'user-status': 'active',
        },
      });
    });

    it('adds the user to `editedBy` array', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy[body.deal.editedBy.length - 1]).toEqual({
        date: expect.any(String),
        username: anHSBCMaker.username,
        roles: anHSBCMaker.roles,
        bank: anHSBCMaker.bank,
        userId: anHSBCMaker._id,
      });
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Further Maker\'s input required"', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Further Maker\'s input required',
      };

      await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('does NOT add the user to `editedBy` array if a checker changes status to "Submitted"', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Yay!',
        status: 'Submitted',
      };

      await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
      expect(body.deal.editedBy.length).toEqual(0);
    });

    it('rejects "Abandoned Deal" updates if no comment provided.', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Abandoned Deal',
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when abandoning a deal.',
          },
        },
      });
    });

    it("rejects 'Ready for Checker's approval' updates if no comment provided.", async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Ready for Checker's approval",
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when submitting a deal for review.',
          },
        },
      });
    });

    it('rejects "Further makers Input Required" updates if no comment provided.', async () => {
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Further Maker's input required",
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when returning a deal to maker.',
          },
        },
      });
    });

    it('rejects "Submitted" updates if t+cs not confirmed.', async () => {
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          confirmSubmit: {
            order: '1',
            text: 'Acceptance is required.',
          },
        },
      });
    });

    it('rejects "Submitted" updates if user is a maker AND checker that has created the deal.', async () => {
      const dealCreatedBymakerChecker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          maker: aBarclaysMakerChecker,
        },
      };

      const postResult = await as(aBarclaysMakerChecker).post(dealCreatedBymakerChecker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status, body } = await as(aBarclaysMakerChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(401);
    });

    it('rejects "Submitted" updates if user is a maker AND checker that has edited the deal.', async () => {
      const dealEditedByMakerChecker = {
        ...completedDeal,
        editedBy: [
          {
            ...aBarclaysMakerChecker,
            userId: aBarclaysMakerChecker._id,
          },
        ],
      };

      const postResult = await as(aBarclaysMaker).post(dealEditedByMakerChecker).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status, body } = await as(aBarclaysMakerChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(401);
    });

    describe('when the status changes to `Submitted`', () => {
      let createdDeal;
      let updatedDeal;

      beforeEach(async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      });

      it('adds a submissionDate to the deal', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

        // TODO - since we are running inside the same VM as the service during these tests..
        //  we -can- mock the system clock and do accurate assertions here..
        // feels more unit-test-like but something to think about
        expect(body.deal.details.submissionDate).toBeDefined();
      });

      it('creates type_a xml if deal successfully submitted', async () => {
        const files = [
          {
            filename: 'test-file-1.txt',
            filepath: 'api-tests/fixtures/test-file-1.txt',
            fieldname: 'exporterQuestionnaire',
            type: 'general_correspondence',
          },
          {
            filename: 'test-file-2.txt',
            filepath: 'api-tests/fixtures/test-file-2.txt',
            fieldname: 'exporterQuestionnaire',
            type: 'general_correspondence',
          },
          {
            filename: 'test-file-3.txt',
            filepath: 'api-tests/fixtures/test-file-3.txt',
            fieldname: 'auditedFinancialStatements',
            type: 'financials',
          },
        ];

        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        const createdDeal = postResult.body;

        // Upload supporting docs
        await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${createdDeal._id}/eligibility-documentation`);

        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

        expect(body).toBeDefined();
      });
    });

    describe('when the MIA deal status changes to `Submitted`', () => {
      let createdDeal;
      let updatedDeal;

      beforeEach(async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));
        submittedDeal.details.submissionType = 'Manual Inclusion Application';

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      });

      it('adds an MIA submissionDate to the deal', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

        // TODO - since we are running inside the same VM as the service during these tests..
        //  we -can- mock the system clock and do accurate assertions here..
        // feels more unit-test-like but something to think about
        expect(body.deal.details.submissionDate).toBeDefined();
        expect(body.deal.details.manualInclusionApplicationSubmissionDate).toBeDefined();
      });
    });

    describe('when the status changes to `Submitted` on invalid deal', () => {
      it('return validation errors', async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        submittedDeal.details.previousWorkflowStatus = 'invalid status';

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        const createdDeal = postResult.body;

        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body.errorCount).toBeGreaterThan(0);
        expect(updatedDeal.body.errorCount).toEqual(updatedDeal.body.errorList.length);
      });
    });

    describe('on approved MIA', () => {
      describe('when the status changes to `Ready for Checker\'s approval` on approved MIA', () => {
        it('should add the makers details as MIN maker', async () => {
          const dealCreatedByMaker = {
            ...completedDeal,
            details: {
              ...completedDeal.details,
              submissionType: 'Manual Inclusion Application',
              previousWorkflowStatus: 'approved',
            },
          };

          const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
          const createdDeal = postResult.body;
          const statusUpdate = {
            status: 'Ready for Checker\'s approval',
            comments: 'Yay!',
          };

          const updatedDeal = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

          expect(updatedDeal.body.details.makerMIN.username).toEqual(aBarclaysMaker.username);
        });
      });

      describe('when the status changes to `Submitted` on approved MIA', () => {
        it('should add MIN submissionDate and checkers details as MIN checker', async () => {
          const dealCreatedByMaker = {
            ...completedDeal,
            details: {
              ...completedDeal.details,
              maker: aBarclaysMakerChecker,
              submissionType: 'Manual Inclusion Application',
              previousWorkflowStatus: 'approved',
            },
          };

          const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
          const createdDeal = postResult.body;
          const statusUpdate = {
            status: 'Submitted',
            confirmSubmit: true,
          };

          const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

          expect(updatedDeal.body.details.checkerMIN.username).toEqual(aBarclaysChecker.username);
          expect(updatedDeal.body.details.manualInclusionNoticeSubmissionDate).toBeDefined();
        });
      });
    });
  });
});
