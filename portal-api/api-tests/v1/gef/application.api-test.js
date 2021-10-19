/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/application';
const collectionName = 'gef-application';
const mockApplications = require('../../fixtures/gef/application');
const mockEligibilityCriteria = require('../../fixtures/gef/eligibilityCriteria');

const facilitiesUrl = '/v1/gef/facilities';
const mockFacilities = require('../../fixtures/gef/facilities');

const api = require('../../../src/v1/api');

describe(baseUrl, () => {
  let aMaker;
  let aChecker;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
    // anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);

    api.tfmDealSubmit = tfmDealSubmitSpy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('returns list of all items', async () => {
      await as(aMaker).post(mockApplications[0]).to(baseUrl);
      await as(aMaker).post(mockApplications[1]).to(baseUrl);
      await as(aMaker).post(mockApplications[2]).to(baseUrl);
      await as(aMaker).post(mockApplications[3]).to(baseUrl);
      await as(aMaker).post(mockApplications[4]).to(baseUrl);
      await as(aMaker).post(mockApplications[5]).to(baseUrl);
      await as(aMaker).post(mockApplications[6]).to(baseUrl);
      await as(aMaker).post(mockApplications[7]).to(baseUrl);
      await as(aMaker).post(mockApplications[8]).to(baseUrl);
      await as(aMaker).post(mockApplications[9]).to(baseUrl);
      await as(aMaker).post(mockApplications[10]).to(baseUrl);
      await as(aMaker).post(mockApplications[11]).to(baseUrl);
      await as(aMaker).post(mockApplications[12]).to(baseUrl);
      await as(aMaker).post(mockApplications[13]).to(baseUrl);
      await as(aMaker).post(mockApplications[14]).to(baseUrl);

      // MW: couldn't get the promise.all running in sequential order
      // await mockApplications.map(async (item) => {
      //   return as(aMaker).post(item).to(baseUrl);
      // })

      // await Promise.all(promise);

      const { body, status } = await as(aChecker).get(baseUrl);

      const expected = {
        items: mockApplications.map((item) => ({
          ...expectMongoId(item),
          exporterId: expect.any(String),
          eligibility: {
            criteria: mockEligibilityCriteria,
            updatedAt: expect.any(Number),
            statis: 'NOT_STARTED',
          },
          createdAt: expect.any(Number),
          status: 'DRAFT',
          dealType: 'GEF',
          submissionType: null,
          submissionCount: 0,
          submissionDate: null,
          supportingInformation: {},
          ukefDealId: null,
          checkerId: null,
        })),
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns an individual item', async () => {
      const item = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      const expected = {
        ...mockApplications[0],
        exporterId: expect.any(String),
        eligibility: {
          criteria: mockEligibilityCriteria,
          updatedAt: expect.any(Number),
          statis: 'NOT_STARTED',
        },
        status: 'DRAFT',
        createdAt: expect.any(Number),
        dealType: 'GEF',
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {
          status: 'NOT_STARTED',
        },
        ukefDealId: null,
        checkerId: null,
      };
      expect(body).toEqual(expectMongoId(expected));
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`GET ${baseUrl}/status/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/status/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a status', async () => {
      const item = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/status/${item.body._id}`);
      expect(body).toEqual({ status: 'DRAFT' });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`POST ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(mockApplications[0]).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { status } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      expect(status).toEqual(201);
    });

    it('returns a new application upon creation', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const expected = {
        ...mockApplications[0],
        exporterId: expect.any(String),
        status: 'DRAFT',
        createdAt: expect.any(Number),
        dealType: 'GEF',
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {},
        ukefDealId: null,
        checkerId: null,
        eligibility: {
          criteria: mockEligibilityCriteria,
          updatedAt: expect.any(Number),
        },
      };
      expect(body).toEqual(expectMongoId(expected));
    });

    it('it tells me the Bank Internal Ref Name is null', async () => {
      const removeName = {
        ...mockApplications[0],
        bankInternalRefName: null,
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);
      expect(body).toEqual([{
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'bankInternalRefName is Mandatory',
      }]);
      expect(status).toEqual(422);
    });

    it('it tells me the Bank Internal Ref Name is an empty string', async () => {
      const removeName = {
        ...mockApplications[0],
        bankInternalRefName: '',
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);
      expect(body).toEqual([{
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'bankInternalRefName is Mandatory',
      }]);
      expect(status).toEqual(422);
    });
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    const updated = {
      ...mockApplications[0],
      bankInternalRefName: 'Updated Ref Name - Unit Test',
      submissionType: 'Automatic Inclusion Notice',
    };

    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updated).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/${body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`PUT ${baseUrl}/status/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({ status: 'COMPLETED' }).to(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).put({ status: 'COMPLETED' }).to(`${baseUrl}/status/${body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a enum error if an incorrect status is sent', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const res = await as(aMaker).put({ status: 'NOT_A_STATUS' }).to(`${baseUrl}/status/${body._id}`);
      expect(res.status).toEqual(422);
      expect(res.body).toEqual([{
        errCode: 'ENUM_ERROR',
        errRef: 'status',
        errMsg: 'Unrecognised enum',
      }]);
    });

    describe('when new status is `SUBMITTED_TO_UKEF`', () => {
      it('adds the ukef deal id', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        expect(body.ukefDealId).toBeNull();

        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.ukefDealId).toEqual(expect.any(String));
      });

      it('increases submissionCount', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionCount).toEqual(1);
      });

      it('adds submissionDate', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionDate).toEqual(expect.any(String));
      });

      it('does NOT add submissionDate if already exists', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const firstPutResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(firstPutResponse.status).toEqual(200);

        const initialSubmissionDate = firstPutResponse.body.submissionDate;
        expect(firstPutResponse.body.submissionDate).toEqual(expect.any(String));

        // submit again, check that the submissionDate has not changed.
        const secondPutResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(secondPutResponse.status).toEqual(200);

        expect(secondPutResponse.body.submissionDate).toEqual(initialSubmissionDate);
      });

      it('adds a ukefFacilityId to each issued facility associated with the application', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const applicationId = body._id;

        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.hasBeenIssued === true);
        const createFacilityResponse = await as(aMaker).post({ applicationId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have ukefFacilityId
        expect(createFacilityResponse.body.details.ukefFacilityId).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated ukefFacilityId
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);
        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.ukefFacilityId).toEqual(expect.any(String));
      });

      it('adds submittedAsIssuedDate to each issued facility associated with the application', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const applicationId = body._id;

        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.hasBeenIssued === true);
        const createFacilityResponse = await as(aMaker).post({ applicationId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have submittedAsIssuedDate
        expect(createFacilityResponse.body.details.submittedAsIssuedDate).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated submittedAsIssuedDate
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);
        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.submittedAsIssuedDate).toEqual(expect.any(String));
      });

      it('calls api.tfmDealSubmit', async () => {
        const mockApplication = mockApplications[0];

        const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const applicationId = body._id;

        await as(aChecker).put({ status: 'SUBMITTED_TO_UKEF' }).to(`${baseUrl}/status/${applicationId}`);

        const expectedChecker = {
          _id: expect.any(Object),
          bank: aChecker.bank,
          email: aChecker.email,
          username: aChecker.username,
          roles: aChecker.roles,
          firstname: aChecker.firstname,
          surname: aChecker.surname,
          timezone: aChecker.timezone,
          lastLogin: expect.any(String),
          'user-status': 'active',
        };

        expect(tfmDealSubmitSpy.mock.calls[0][0]).toEqual(applicationId);
        expect(tfmDealSubmitSpy.mock.calls[0][1]).toEqual(mockApplication.dealType);
        expect(tfmDealSubmitSpy.mock.calls[0][2]).toEqual(expectedChecker);
      });
    });

    it('returns a 404 when application does not exist', async () => {
      const { status } = await as(aMaker).put({ status: 'COMPLETED' }).to(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(404);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(`${baseUrl}`);
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(body._id)}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });
});
