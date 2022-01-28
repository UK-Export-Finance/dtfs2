const wipeDB = require('../../wipeDB');
const CONSTANTS = require('../../../src/constants');
const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const mockApplications = require('../../fixtures/gef/application');

const dealsCollectionName = 'deals';
const gefDealUrl = '/v1/gef/application';

const mockPayload = {
  submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA,
  submissionDate: '1643223993967',
  exporter: { companyName: 'Test company' },
  ukefDecision: [{ timestamp: Date.now() }
  ]
};

describe('v1/reports/review-ukef-decision', () => {
  let aMaker;
  let aChecker;
  let mockApplication;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([dealsCollectionName]);

    // create a GEF deal
    mockApplication = await as(aMaker).post({ ...mockApplications[0], bank: { id: aMaker.bank.id } }).to(gefDealUrl);
  });

  it('retrieves all deals with a status `UKEF_APPROVED_WITHOUT_CONDITIONS` (Maker)', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([{
      dealId: expect.any(String),
      bankInternalRefName: expect.any(String),
      dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
      companyName: expect.any(String),
      dateCreatedEpoch: expect.any(Number),
      dateOfApprovalEpoch: expect.any(Number),
      submissionDateEpoch: expect.any(String),
      dateCreated: expect.any(String),
      submissionDate: expect.any(String),
      dateOfApproval: expect.any(String),
      daysToReview: 10 // key difference between UKEF_APPROVED_WITH_CONDITIONS and UKEF_APPROVED_WITHOUT_CONDITIONS
    }]);
  });

  it('should return an empty array if the user belongs to a different bank `UKEF_APPROVED_WITHOUT_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports as a CHECKER
    const { status: reportsStatus, body: reportsBody } = await as(aChecker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves all deals with a status `UKEF_APPROVED_WITH_CONDITIONS` (Maker)', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports as a MAKER
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([{
      dealId: expect.any(String),
      bankInternalRefName: expect.any(String),
      dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
      companyName: expect.any(String),
      dateCreatedEpoch: expect.any(Number),
      dateOfApprovalEpoch: expect.any(Number),
      submissionDateEpoch: expect.any(String),
      dateCreated: expect.any(String),
      submissionDate: expect.any(String),
      dateOfApproval: expect.any(String),
      daysToReview: 20 // key difference between UKEF_APPROVED_WITH_CONDITIONS and UKEF_APPROVED_WITHOUT_CONDITIONS
    }]);
  });

  it('should return an empty array if the user belongs to a different bank `UKEF_APPROVED_WITH_CONDITIONS`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports as a CHECKER
    const { status: reportsStatus, body: reportsBody } = await as(aChecker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is unknown', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: 'Unknown' };
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is `Rejected by Ukef`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_REFUSED };
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal status is `Abandoned`', async () => {
    mockPayload.ukefDecision[0].decision = CONSTANTS.DEAL.DEAL_STATUS.ABANDONED;
    // update the GEF deal
    const { status } = await as(aMaker).put(mockPayload).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(status).toEqual(200);

    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.ABANDONED };
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the `ukefDecision` property does not exist and the query is `UKEF_APPROVED_WITH_CONDITIONS`', async () => {
    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the `ukefDecision` property does not exist and the query is `UKEF_APPROVED_WITHOUT_CONDITIONS`', async () => {
    const mockQuery = { ukefDecision: CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS };
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get('/v1/reports/review-ukef-decision', mockQuery);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });
});
