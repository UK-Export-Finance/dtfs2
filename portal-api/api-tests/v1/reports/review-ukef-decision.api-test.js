const databaseHelper = require('../../database-helper');
const CONSTANTS = require('../../../server/constants');
const app = require('../../../server/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const mockApplications = require('../../fixtures/gef/application');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../server/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const dealsCollectionName = DB_COLLECTIONS.DEALS;
const gefDealUrl = '/v1/gef/application';

const mockPayload = {
  submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
  submissionDate: '1643223993967',
  exporter: { companyName: 'Test company' },
  ukefDecision: [{ timestamp: Date.now() }],
};

describe('GET /v1/reports/review-ukef-decision', () => {
  const reviewDecisionReportUrl = '/v1/reports/review-ukef-decision';
  let maker1;
  let checker1;
  let mockApplication;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    maker1 = testUsers().withRole(MAKER).one();
    checker1 = testUsers().withRole(CHECKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([dealsCollectionName]);

    // create a GEF deal
    mockApplication = await as(maker1)
      .post({ ...mockApplications[0], bank: { id: maker1.bank.id } })
      .to(gefDealUrl);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(reviewDecisionReportUrl),
    makeRequestWithAuthHeader: (authHeader) => get(reviewDecisionReportUrl, { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(reviewDecisionReportUrl),
    successStatusCode: 200,
  });

  it('retrieves all deals with a ukefDecision status set to `UKEF_APPROVED_WITHOUT_CONDITIONS` (Maker)', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    // update the GEF deal
    const { status, body } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    // update the `status` to 'UKEF_APPROVED_WITHOUT_CONDITIONS'
    await as(maker1).put({ status: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS }).to(`${gefDealUrl}/status/${body._id}`);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([
      {
        dealId: expect.any(String),
        bankInternalRefName: expect.any(String),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        status: expect.any(String),
        companyName: expect.any(String),
        dateCreatedEpoch: expect.any(Number),
        dateOfApprovalEpoch: expect.any(Number),
        submissionDateEpoch: expect.any(String),
        dateCreated: expect.any(String),
        submissionDate: expect.any(String),
        dateOfApproval: expect.any(String),
        daysToReview: 10, // key difference between UKEF_APPROVED_WITH_CONDITIONS and UKEF_APPROVED_WITHOUT_CONDITIONS
      },
    ]);
  });

  it('should return an empty array if the user belongs to a different bank `UKEF_APPROVED_WITHOUT_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    // update the GEF deal
    const { status } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a CHECKER
    const { status: reportsStatus, body: reportsBody } = await as(checker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('should return an empty array if the status is `Completed` and ukefDecision `UKEF_APPROVED_WITHOUT_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    // update the GEF deal
    const { status, body } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    // update the `status` to 'COMPLETED'
    await as(maker1).put({ status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED }).to(`${gefDealUrl}/status/${body._id}`);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves all deals with a ukefDecision status set to `UKEF_APPROVED_WITH_CONDITIONS` (Maker)', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status, body } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    // update the `status` to 'UKEF_APPROVED_WITH_CONDITIONS'
    await as(maker1).put({ status: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS }).to(`${gefDealUrl}/status/${body._id}`);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([
      {
        dealId: expect.any(String),
        bankInternalRefName: expect.any(String),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        status: expect.any(String),
        companyName: expect.any(String),
        dateCreatedEpoch: expect.any(Number),
        dateOfApprovalEpoch: expect.any(Number),
        submissionDateEpoch: expect.any(String),
        dateCreated: expect.any(String),
        submissionDate: expect.any(String),
        dateOfApproval: expect.any(String),
        daysToReview: 20, // key difference between UKEF_APPROVED_WITH_CONDITIONS and UKEF_APPROVED_WITHOUT_CONDITIONS
      },
    ]);
  });

  it('should return an empty array if the status is `Completed` and ukefDecision `UKEF_APPROVED_WITH_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status, body } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    // update the `status` to 'COMPLETED'
    await as(maker1).put({ status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED }).to(`${gefDealUrl}/status/${body._id}`);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('should return an empty array if the user belongs to a different bank `UKEF_APPROVED_WITH_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision as a CHECKER
    const { status: reportsStatus, body: reportsBody } = await as(checker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is unknown', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: 'Unknown' };
    // perform a GET request to retrieve the the reports for UKEF decision
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is `Rejected by Ukef`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED;
    // update the GEF deal
    const { status } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED };
    // perform a GET request to retrieve the reports for UKEF decision
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is `Abandoned`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.ABANDONED;
    // update the GEF deal
    const { status } = await as(maker1).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.ABANDONED };
    // perform a GET request to retrieve the reports for UKEF decision
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the `ukefDecision` property does not exist and the query is `UKEF_APPROVED_WITH_CONDITIONS`', async () => {
    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the `ukefDecision` property does not exist and the query is `UKEF_APPROVED_WITHOUT_CONDITIONS`', async () => {
    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the reports for UKEF decision
    const { status: reportsStatus, body: reportsBody } = await as(maker1).get(reviewDecisionReportUrl, mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });
});
