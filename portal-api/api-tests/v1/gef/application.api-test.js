const { format, fromUnixTime } = require('date-fns');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const { exporterStatus } = require('../../../src/v1/gef/controllers/validation/exporter');

const CONSTANTS = require('../../../src/constants');

const mockApplications = require('../../fixtures/gef/application');
const mockEligibilityCriteria = require('../../fixtures/gef/eligibilityCriteria');
const mockFacilities = require('../../fixtures/gef/facilities');

const api = require('../../../src/v1/api');

const baseUrl = '/v1/gef/application';
const facilitiesUrl = '/v1/gef/facilities';
const collectionName = 'deals';

const mockEligibilityCriteriaLatestVersion = mockEligibilityCriteria.find((criteria) =>
  criteria.version === 1.5);

describe(baseUrl, () => {
  let aMaker;
  let aChecker;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
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

      const { body, status } = await as(aChecker).get(baseUrl);

      const expected = {
        items: mockApplications.map((item) => ({
          ...expectMongoId(item),
          exporter: {
            status: expect.any(String),
            updatedAt: expect.any(Number),
          },
          maker: expect.any(Object),
          eligibility: {
            criteria: mockEligibilityCriteriaLatestVersion.terms.map((criterion) => ({
              ...criterion,
              answer: null,
            })),
          },
          editedBy: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: CONSTANTS.DEAL.GEF_STATUS.DRAFT,
          dealType: 'GEF',
          submissionType: null,
          submissionCount: 0,
          submissionDate: null,
          supportingInformation: {},
          ukefDealId: null,
          checkerId: null,
          portalActivities: [],
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
        exporter: {
          status: expect.any(String),
          updatedAt: expect.any(Number),
        },
        maker: expect.any(Object),
        eligibility: {
          criteria: mockEligibilityCriteriaLatestVersion.terms.map((criterion) => ({
            ...criterion,
            answer: null,
          })),
          status: CONSTANTS.DEAL.GEF_STATUS.NOT_STARTED,
        },
        status: CONSTANTS.DEAL.GEF_STATUS.DRAFT,
        editedBy: expect.any(Array),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        dealType: 'GEF',
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {
          status: CONSTANTS.DEAL.GEF_STATUS.NOT_STARTED,
        },
        ukefDealId: null,
        checkerId: null,
        portalActivities: [],
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
      expect(body).toEqual({ status: CONSTANTS.DEAL.GEF_STATUS.DRAFT });
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
        exporter: {},
        status: CONSTANTS.DEAL.GEF_STATUS.DRAFT,
        editedBy: expect.any(Array),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        dealType: 'GEF',
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {},
        ukefDealId: null,
        checkerId: null,
        portalActivities: [],
        eligibility: {
          criteria: mockEligibilityCriteriaLatestVersion.terms.map((criterion) => ({
            ...criterion,
            answer: null,
          })),
        },
      };
      expect(body).toEqual({
        ...expectMongoId(expected),
        maker: expect.any(Object),
        exporter: {
          status: expect.any(String),
          updatedAt: expect.any(Number),
        },
      });

      expect(body.maker.token).toBeUndefined();
      expect(body.maker.password).toBeUndefined();
      expect(body.maker.lastLogin).toBeUndefined();
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
      submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
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

    it('adds exporter.status and timestamp when exporter is passed', async () => {
      const exporterUpdate = {
        exporter: {
          test: true,
        },
      };

      const { body: createdDeal } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { body } = await as(aMaker).put(updated).to(`${baseUrl}/${createdDeal._id}`);

      const expected = exporterStatus(exporterUpdate.exporter);
      expect(body.exporter.status).toEqual(expected);
      expect(typeof body.exporter.updatedAt).toEqual('number');
    });
  });

  describe(`PUT ${baseUrl}/status/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({ status: CONSTANTS.DEAL.GEF_STATUS.COMPLETED }).to(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.COMPLETED }).to(`${baseUrl}/status/${body._id}`);
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

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.ukefDealId).toEqual(expect.any(String));
      });

      it('increases submissionCount', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionCount).toEqual(1);
      });

      it('adds submissionDate', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionDate).toEqual(expect.any(String));
      });

      it('does NOT add submissionDate if already exists', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const firstPutResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(firstPutResponse.status).toEqual(200);

        const initialSubmissionDate = firstPutResponse.body.submissionDate;
        expect(firstPutResponse.body.submissionDate).toEqual(expect.any(String));

        // submit again, check that the submissionDate has not changed.
        const secondPutResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(secondPutResponse.status).toEqual(200);

        expect(secondPutResponse.body.submissionDate).toEqual(initialSubmissionDate);
      });

      it('adds a ukefFacilityId to each issued facility associated with the application', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;

        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.hasBeenIssued === true);
        const createFacilityResponse = await as(aMaker).post({ dealId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have ukefFacilityId
        expect(createFacilityResponse.body.details.ukefFacilityId).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated ukefFacilityId
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);
        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.ukefFacilityId).toEqual(expect.any(String));
      });

      it('adds submittedAsIssuedDate to each issued facility associated with the application', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;

        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.hasBeenIssued === true);
        const createFacilityResponse = await as(aMaker).post({ dealId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have submittedAsIssuedDate
        expect(createFacilityResponse.body.details.submittedAsIssuedDate).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated submittedAsIssuedDate
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);
        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.submittedAsIssuedDate).toEqual(expect.any(String));
      });

      it('adds coverStartDate if cover starts on submission (shouldCoverStartOnSubmission === true)', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;
        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.shouldCoverStartOnSubmission === true);

        const createFacilityResponse = await as(aMaker).post({ dealId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;
        // check that the facility does not already have submittedAsIssuedDate
        expect(createFacilityResponse.body.details.submittedAsIssuedDate).toEqual(null);
        // ensures that should shouldCoverStartOnSubmission is null
        expect(createFacilityResponse.body.details.shouldCoverStartOnSubmission).toEqual(null);

        // update facility so that shouldCoverStartOnSubmission and coverStartDate are added to the facility
        const facilityWithDates = await as(aMaker).put(issuedFacility).to(`${facilitiesUrl}/${facilityId}`);
        expect(facilityWithDates.status).toEqual(200);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated submittedAsIssuedDate and cover start date is set to todays date
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);

        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.submittedAsIssuedDate).toEqual(expect.any(String));
        expect(getFacilityResponse.body.details.shouldCoverStartOnSubmission).toEqual(true);

        // in date format to avoid mismatch in times
        const receivedDate = format(new Date(getFacilityResponse.body.details.coverStartDate), 'dd-MMMM-yyyy');
        const expected = format(new Date(), 'dd-MMMM-yyyy');
        expect(receivedDate).toEqual(expected);
      });

      it('coverStartDate is issueDate if (shouldCoverStartOnSubmission === true) && changedToIssued === true', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;
        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.changedToIssued === true);

        const createFacilityResponse = await as(aMaker).post({ dealId, ...issuedFacility }).to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;
        // adds a submittedAsIssuedDate
        expect(createFacilityResponse.body.details.submittedAsIssuedDate).toEqual(null);
        // ensures that should shouldCoverStartOnSubmission is null
        expect(createFacilityResponse.body.details.shouldCoverStartOnSubmission).toEqual(null);

        // update facility so that shouldCoverStartOnSubmission and coverStartDate are added to the facility
        const facilityWithDates = await as(aMaker).put(issuedFacility).to(`${facilitiesUrl}/${facilityId}`);
        expect(facilityWithDates.status).toEqual(200);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated submittedAsIssuedDate and cover start date is set to todays date
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);

        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.submittedAsIssuedDate).toEqual(expect.any(String));
        expect(getFacilityResponse.body.details.shouldCoverStartOnSubmission).toEqual(true);

        // formats date into correct format
        const receivedDate = new Date(getFacilityResponse.body.details.coverStartDate);
        const receivedDateFormatted = new Date(receivedDate);
        const expected = (new Date(getFacilityResponse.body.details.issueDate)).setHours(0, 0, 0, 0);
        const expectedFormatted = new Date(expected);
        expect(receivedDateFormatted).toEqual(expectedFormatted);
      });

      it('calls api.tfmDealSubmit', async () => {
        const mockApplication = mockApplications[0];

        const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const dealId = body._id;

        await as(aChecker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${dealId}`);

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

        expect(tfmDealSubmitSpy.mock.calls[0][0]).toEqual(dealId);
        expect(tfmDealSubmitSpy.mock.calls[0][1]).toEqual(mockApplication.dealType);
        expect(tfmDealSubmitSpy.mock.calls[0][2]).toEqual(expectedChecker);
      });
    });

    it('returns a 404 when application does not exist', async () => {
      const { status } = await as(aMaker).put({ status: CONSTANTS.DEAL.GEF_STATUS.COMPLETED }).to(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(404);
    });

    it('adds an submission object to portalActivities array', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const dealId = body._id;

      // adds required fields to the gef deal
      await as(aChecker).put({ checkerId: aChecker._id, submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${baseUrl}/${dealId}`);
      const putResponse = await as(aChecker).put({ status: CONSTANTS.DEAL.GEF_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${dealId}`);

      const result = putResponse.body.portalActivities[0];
      expect(result.type).toEqual('NOTICE');

      // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);

      expect(result.text).toEqual('');
      expect(result.label).toEqual('Manual inclusion application submitted to UKEF');

      // get author object from achecker
      const author = {
        firstName: aChecker.firstname,
        lastName: aChecker.surname,
        _id: aChecker._id,
      };
      expect(result.author).toEqual(author);
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
