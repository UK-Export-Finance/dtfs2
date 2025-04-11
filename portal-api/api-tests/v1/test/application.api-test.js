const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, getCurrentGefDealVersion } = require('@ukef/dtfs2-common');
const { format, fromUnixTime } = require('date-fns');
const {
  generateParsedMockPortalUserAuditDatabaseRecord,
  generateMockPortalUserAuditDatabaseRecord,
  withDeleteOneTests,
  withDeleteManyTests,
  expectAnyPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');

const { as, get, remove } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const { exporterStatus } = require('../../../src/v1/gef/controllers/validation/exporter');

const CONSTANTS = require('../../../src/constants');

const mockApplications = require('../../fixtures/gef/application');
const mockEligibilityCriteria = require('../../fixtures/gef/eligibilityCriteria');
const mockFacilities = require('../../fixtures/gef/facilities');
const externalApi = require('../../../src/external-api/api');

const api = require('../../../src/v1/api');
const { STATUS } = require('../../../src/constants/user');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const mockSuccessfulResponse = {
  data: {
    status: 200,
    data: [
      {
        id: 12345678,
        maskedId: CONSTANTS.NUMBER.UKEF_ID.TEST,
        type: 1,
        createdBy: CONSTANTS.NUMBER.USER.DTFS,
        createdDatetime: '2024-01-01T00:00:00.000Z',
        requestingSystem: CONSTANTS.NUMBER.USER.DTFS,
      },
    ],
  },
};

jest.mock('../../../src/external-api/api', () => ({
  sendEmail: jest.fn(() => Promise.resolve({})),
  number: {
    getNumber: jest.fn(() => Promise.resolve(mockSuccessfulResponse)),
  },
}));

const baseUrl = '/v1/gef/application';
const facilitiesUrl = '/v1/gef/facilities';
const collectionName = DB_COLLECTIONS.DEALS;

const mockEligibilityCriteriaLatestVersion = mockEligibilityCriteria.find((criteria) => criteria.version === 2.1);

describe(baseUrl, () => {
  let aMaker;
  let aChecker;
  let testUsers;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
    aChecker = testUsers().withRole(CHECKER).one();

    await databaseHelper.wipe(DB_COLLECTIONS.DEALS);
  });

  beforeEach(async () => {
    await databaseHelper.wipe([collectionName]);

    api.tfmDealSubmit = tfmDealSubmitSpy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe(`GET ${baseUrl}`, () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(baseUrl),
      makeRequestWithAuthHeader: (authHeader) => get(baseUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(baseUrl),
      successStatusCode: 200,
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
      await as(aMaker).post(mockApplications[15]).to(baseUrl);

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
            _id: expect.any(String),
            product: expect.any(String),
            createdAt: expect.any(Number),
            isInDraft: false,
            version: expect.any(Number),
            criteria: mockEligibilityCriteriaLatestVersion.criteria.map((criterion) => ({
              ...criterion,
              answer: null,
            })),
            auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
          },
          editedBy: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
          dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
          submissionType: null,
          submissionCount: 0,
          submissionDate: null,
          supportingInformation: {},
          ukefDealId: null,
          checkerId: null,
          portalActivities: [],
          auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aMaker._id),
          version: getCurrentGefDealVersion(),
        })),
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    let oneApplicationUrl;

    beforeEach(async () => {
      const {
        body: { _id: applicationId },
      } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      oneApplicationUrl = `${baseUrl}/${applicationId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneApplicationUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneApplicationUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneApplicationUrl),
      successStatusCode: 200,
    });

    it('returns an individual item', async () => {
      const { body } = await as(aMaker).get(oneApplicationUrl);
      const expected = {
        ...mockApplications[0],
        exporter: {
          status: expect.any(String),
          updatedAt: expect.any(Number),
        },
        maker: expect.any(Object),
        eligibility: {
          _id: expect.any(String),
          product: expect.any(String),
          createdAt: expect.any(Number),
          isInDraft: false,
          version: expect.any(Number),
          criteria: mockEligibilityCriteriaLatestVersion.criteria.map((criterion) => ({
            ...criterion,
            answer: null,
          })),
          status: CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED,
          auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
        },
        status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
        editedBy: expect.any(Array),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {
          status: CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED,
        },
        ukefDealId: null,
        checkerId: null,
        portalActivities: [],
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aMaker._id),
        version: getCurrentGefDealVersion(),
      };
      expect(body).toEqual(expectMongoId(expected));
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`GET ${baseUrl}/status/:id`, () => {
    let oneApplicationStatusUrl;

    beforeEach(async () => {
      const {
        body: { _id: applicationId },
      } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      oneApplicationStatusUrl = `${baseUrl}/status/${applicationId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneApplicationStatusUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneApplicationStatusUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneApplicationStatusUrl),
      successStatusCode: 200,
    });

    it('returns a status', async () => {
      const { body } = await as(aMaker).get(oneApplicationStatusUrl);
      expect(body).toEqual({ status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT });
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
        status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
        editedBy: expect.any(Array),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        submissionType: null,
        submissionCount: 0,
        submissionDate: null,
        supportingInformation: {},
        ukefDealId: null,
        checkerId: null,
        portalActivities: [],
        version: getCurrentGefDealVersion(),
        eligibility: {
          version: expect.any(Number),
          _id: expect.any(String),
          product: expect.any(String),
          createdAt: expect.any(Number),
          isInDraft: false,
          criteria: mockEligibilityCriteriaLatestVersion.criteria.map((criterion) => ({
            ...criterion,
            answer: null,
          })),
          auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
        },
      };
      expect(body).toEqual({
        ...expectMongoId(expected),
        maker: expect.any(Object),
        exporter: {
          status: expect.any(String),
          updatedAt: expect.any(Number),
        },
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aMaker._id),
      });

      expect(body.maker.token).toBeUndefined();
      expect(body.maker.password).toBeUndefined();
      expect(body.maker.lastLogin).toBeUndefined();
    });

    it('tells me the Bank Internal Ref Name is null', async () => {
      const removeName = {
        ...mockApplications[0],
        bankInternalRefName: null,
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);

      expect(status).toEqual(422);
      expect(body).toEqual([
        {
          status: 422,
          errCode: 'MANDATORY_FIELD',
          errRef: 'bankInternalRefName',
          errMsg: 'bankInternalRefName is Mandatory',
        },
      ]);
    });

    it('tells me the Bank Internal Ref Name is an empty string', async () => {
      const removeName = {
        ...mockApplications[0],
        bankInternalRefName: '',
      };
      const { body, status } = await as(aMaker).post(removeName).to(baseUrl);

      expect(status).toEqual(422);
      expect(body).toEqual([
        {
          status: 422,
          errCode: 'MANDATORY_FIELD',
          errRef: 'bankInternalRefName',
          errMsg: 'bankInternalRefName is Mandatory',
        },
      ]);
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

    it('rejects requests that do not have a valid mongodb id', async () => {
      const { status, body } = await as(aMaker).put(updated).to(`${baseUrl}/abc`);
      expect(status).toEqual(400);
      expect(body).toStrictEqual({ status: 400, message: 'Invalid Deal Id' });
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
      const { status } = await as().put({ status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED }).to(`${baseUrl}/status/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const { status } = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED }).to(`${baseUrl}/status/${body._id}`);
      expect(status).toEqual(200);
    });

    it('returns a enum error if an incorrect status is sent', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const res = await as(aMaker).put({ status: 'NOT_A_STATUS' }).to(`${baseUrl}/status/${body._id}`);
      expect(res.status).toEqual(422);
      expect(res.body).toEqual([
        {
          status: 422,
          errCode: 'ENUM_ERROR',
          errRef: 'status',
          errMsg: 'Unrecognised enum',
        },
      ]);
    });

    describe('status update emails', () => {
      const expectedEmailVariables = (maker, updatedByUser, deal) => ({
        firstName: maker.firstName,
        surname: maker.surname,
        submissionType: deal.submissionType,
        supplierName: deal.exporter.companyName,
        bankInternalRefName: deal.bankInternalRefName,
        currentStatus: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF,
        previousStatus: deal.status,
        updatedByName: `${updatedByUser.firstname} ${updatedByUser.surname}`,
        updatedByEmail: updatedByUser.email,
      });

      describe(`when new status is ${CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL}`, () => {
        it('sends an email', async () => {
          const mockApplication = mockApplications[0];
          const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
          expect(body.submissionCount).toEqual(0);

          const dealId = body._id;
          await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL }).to(`${baseUrl}/status/${dealId}`);

          const firstSendEmailCall = externalApi.sendEmail.mock.calls[0][0];

          expect(firstSendEmailCall).toEqual(
            CONSTANTS.EMAIL_TEMPLATE_IDS.UPDATE_STATUS,
            aMaker.bank.emails[0],
            expectedEmailVariables(aMaker, aMaker, mockApplication),
          );
        });
      });

      describe(`when new status is ${CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED}`, () => {
        it('sends an email', async () => {
          const mockApplication = mockApplications[0];
          const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
          expect(body.submissionCount).toEqual(0);

          const dealId = body._id;
          await as(aChecker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED }).to(`${baseUrl}/status/${dealId}`);

          const firstSendEmailCall = externalApi.sendEmail.mock.calls[0][0];

          expect(firstSendEmailCall).toEqual(
            CONSTANTS.EMAIL_TEMPLATE_IDS.UPDATE_STATUS,
            aMaker.bank.emails[0],
            expectedEmailVariables(aMaker, aChecker, mockApplication),
          );
        });
      });

      describe(`when new status is ${CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF}`, () => {
        it('sends an email', async () => {
          const mockApplication = mockApplications[0];
          const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
          expect(body.submissionCount).toEqual(0);

          const dealId = body._id;
          await as(aChecker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${dealId}`);

          const firstSendEmailCall = externalApi.sendEmail.mock.calls[0][0];

          expect(firstSendEmailCall).toEqual(
            CONSTANTS.EMAIL_TEMPLATE_IDS.UPDATE_STATUS,
            aChecker.bank.emails[0],
            expectedEmailVariables(aMaker, aChecker, mockApplication),
          );
        });
      });
    });

    describe('when new status is `SUBMITTED_TO_UKEF`', () => {
      it('adds the ukef deal id', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        expect(body.ukefDealId).toBeNull();

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.ukefDealId).toEqual(expect.any(String));
      });

      it('increases submissionCount', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionCount).toEqual(1);
      });

      it('adds submissionDate', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);
        expect(putResponse.body.submissionDate).toEqual(expect.any(String));
      });

      it('does NOT add submissionDate if already exists', async () => {
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);

        const firstPutResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(firstPutResponse.status).toEqual(200);

        const initialSubmissionDate = firstPutResponse.body.submissionDate;
        expect(firstPutResponse.body.submissionDate).toEqual(expect.any(String));

        // submit again, check that the submissionDate has not changed.
        const secondPutResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(secondPutResponse.status).toEqual(200);

        expect(secondPutResponse.body.submissionDate).toEqual(initialSubmissionDate);
      });

      it('adds a ukefFacilityId to each issued facility associated with the application', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;

        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.hasBeenIssued === true);
        const createFacilityResponse = await as(aMaker)
          .post({ dealId, ...issuedFacility })
          .to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have ukefFacilityId
        expect(createFacilityResponse.body.details.ukefFacilityId).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
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
        const createFacilityResponse = await as(aMaker)
          .post({ dealId, ...issuedFacility })
          .to(facilitiesUrl);
        expect(createFacilityResponse.status).toEqual(201);

        const facilityId = createFacilityResponse.body.details._id;

        // check that the facility does not already have submittedAsIssuedDate
        expect(createFacilityResponse.body.details.submittedAsIssuedDate).toEqual(null);

        // change deal status to submitted
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
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

        const createFacilityResponse = await as(aMaker)
          .post({ dealId, ...issuedFacility })
          .to(facilitiesUrl);
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
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
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

      it('coverStartDate is issueDate if (shouldCoverStartOnSubmission === true) && canResubmitIssuedFacilities === true', async () => {
        // create deal
        const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
        const dealId = body._id;
        // create issued facility that's associated with the deal
        const issuedFacility = mockFacilities.find((f) => f.canResubmitIssuedFacilities === true);

        const createFacilityResponse = await as(aMaker)
          .post({ dealId, ...issuedFacility })
          .to(facilitiesUrl);
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
        const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${body._id}`);
        expect(putResponse.status).toEqual(200);

        // check that the facility has updated submittedAsIssuedDate and cover start date is set to todays date
        const getFacilityResponse = await as(aMaker).get(`${facilitiesUrl}/${facilityId}`);

        expect(getFacilityResponse.status).toEqual(200);
        expect(getFacilityResponse.body.details.submittedAsIssuedDate).toEqual(expect.any(String));
        expect(getFacilityResponse.body.details.shouldCoverStartOnSubmission).toEqual(true);

        // formats date into correct format
        const receivedDate = new Date(getFacilityResponse.body.details.coverStartDate);
        const receivedDateFormatted = new Date(receivedDate);
        const expected = new Date(getFacilityResponse.body.details.issueDate).setHours(0, 0, 0, 0);
        const expectedFormatted = new Date(expected);
        expect(receivedDateFormatted).toEqual(expectedFormatted);
      });

      it('calls api.tfmDealSubmit', async () => {
        const mockApplication = mockApplications[0];

        const { body } = await as(aMaker).post(mockApplication).to(baseUrl);
        expect(body.submissionCount).toEqual(0);

        const dealId = body._id;

        await as(aChecker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${dealId}`);

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
          'user-status': STATUS.ACTIVE,
          isTrusted: aChecker.isTrusted,
        };

        expect(tfmDealSubmitSpy.mock.calls[0][0]).toEqual(dealId);
        expect(tfmDealSubmitSpy.mock.calls[0][1]).toEqual(mockApplication.dealType);
        expect(tfmDealSubmitSpy.mock.calls[0][2]).toEqual(expectedChecker);
      });
    });

    it('returns a 404 when application does not exist', async () => {
      const { status } = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED }).to(`${baseUrl}/status/doesnotexist`);
      expect(status).toEqual(404);
    });

    it('adds a submission object to portalActivities array', async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(baseUrl);
      const dealId = body._id;

      // adds required fields to the gef deal
      await as(aChecker).put({ checkerId: aChecker._id, submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${baseUrl}/${dealId}`);
      const putResponse = await as(aChecker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${baseUrl}/status/${dealId}`);
      const result = putResponse.body.portalActivities[0];
      expect(result.type).toEqual('NOTICE');

      // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);

      expect(result.text).toEqual('');
      expect(result.label).toEqual('Manual inclusion application submitted to UKEF');
      // get author object from aChecker
      const author = {
        firstName: aChecker.firstname,
        lastName: aChecker.surname,
        _id: aChecker._id,
      };
      expect(result.author).toEqual(author);
    });
  });

  describe(`PUT ${baseUrl}/supporting-information/:id`, () => {
    it('rejects requests that do not have a valid mongodb id', async () => {
      const { status, body } = await as(aMaker).put({}).to(`${baseUrl}/supporting-information/abc`);
      expect(status).toEqual(400);
      expect(body).toStrictEqual({ status: 400, message: 'Invalid Deal Id' });
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    let applicationToDeleteId;
    let facilitiesToDeleteIds;

    beforeEach(async () => {
      const { body } = await as(aMaker).post(mockApplications[0]).to(`${baseUrl}`);
      applicationToDeleteId = new ObjectId(body._id);

      const {
        body: { details: facility0 },
      } = await as(aMaker)
        .post({ ...mockFacilities[0], dealId: applicationToDeleteId })
        .to(facilitiesUrl);
      const {
        body: { details: facility1 },
      } = await as(aMaker)
        .post({ ...mockFacilities[1], dealId: applicationToDeleteId })
        .to(facilitiesUrl);

      facilitiesToDeleteIds = [new ObjectId(facility0._id), new ObjectId(facility1._id)];
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(`${baseUrl}/${applicationToDeleteId}`),
      makeRequestWithAuthHeader: (authHeader) => remove(`${baseUrl}/${applicationToDeleteId}`, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).remove(`${baseUrl}/${applicationToDeleteId}`),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(aMaker).remove(`${baseUrl}/${applicationToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.DEALS,
      auditRecord: {
        ...generateMockPortalUserAuditDatabaseRecord('abcdef123456abcdef123456'),
        lastUpdatedByPortalUserId: expect.anything(),
      },
      getDeletedDocumentId: () => applicationToDeleteId,
    });

    withDeleteManyTests({
      makeRequest: () => as(aMaker).remove(`${baseUrl}/${applicationToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      auditRecord: {
        ...generateMockPortalUserAuditDatabaseRecord('abcdef123456abcdef123456'),
        lastUpdatedByPortalUserId: expect.anything(),
      },
      getDeletedDocumentIds: () => facilitiesToDeleteIds,
      expectedSuccessResponseBody: { acknowledged: true, deletedCount: 1 },
    });
  });
});
