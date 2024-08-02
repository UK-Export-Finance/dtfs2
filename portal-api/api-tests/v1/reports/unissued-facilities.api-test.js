const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const CONSTANTS = require('../../../src/constants');

const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const mockApplications = require('../../fixtures/gef/application');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const facilitiesCollectionName = DB_COLLECTIONS.FACILITIES;
const dealsCollectionName = DB_COLLECTIONS.DEALS;
const gefDealUrl = '/v1/gef/application';
const gefFacilityUrl = '/v1/gef/facilities';

describe('GET /v1/reports/unissued-facilities', () => {
  const unissuedFacilitiesReportUrl = '/v1/reports/unissued-facilities';
  let aMaker;
  let mockApplication;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([facilitiesCollectionName]);
    await databaseHelper.wipe([dealsCollectionName]);

    // create a GEF deal
    mockApplication = await as(aMaker)
      .post({ ...mockApplications[0], bank: { id: aMaker.bank.id } })
      .to(gefDealUrl);

    // add facilities to this deal
    await as(aMaker)
      .post({
        dealId: mockApplication.body._id,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: false,
      })
      .to(gefFacilityUrl);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(unissuedFacilitiesReportUrl),
    makeRequestWithAuthHeader: (authHeader) => get(unissuedFacilitiesReportUrl, { headers: { Authorization: authHeader } }),
  });

  withRoleAuthorisationTests({
    allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
    getUserWithRole: (role) => testUsers().withRole(role).one(),
    makeRequestAsUser: (user) => as(user).get(unissuedFacilitiesReportUrl),
    successStatusCode: 200,
  });

  it('retrieves the unissued facilities based on AIN deals', async () => {
    const updated = { submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN };
    // update the submissionType to AIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // update the `status` to 'Submitted'
    const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${gefDealUrl}/status/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(putResponse.status).toEqual(200);
    // ensure that the submission date has a string format - usually EPOCH
    expect(putResponse.body.submissionDate).toEqual(expect.any(String));

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([
      {
        dealId: expect.any(String),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
        bankInternalRefName: 'Bank 1',
        ukefFacilityId: expect.any(String),
        value: null,
        submissionDate: expect.any(String),
        deadlineForIssuing: expect.any(String),
        daysLeftToIssue: expect.any(Number),
        currencyAndValue: expect.any(String),
      },
    ]);
  });

  it('retrieves the unissued facilities based on MIN deals', async () => {
    const updated = {
      submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      submissionDate: '1639180800000',
      manualInclusionNoticeSubmissionDate: '1639180800000',
    };
    // update the submissionType to MIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // update the `status` to 'Submitted'
    const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${gefDealUrl}/status/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(putResponse.status).toEqual(200);
    // ensure that the submission date has a string format - usually EPOCH
    expect(putResponse.body.submissionDate).toEqual(expect.any(String));

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([
      {
        dealId: expect.any(String),
        dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
        submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
        bankInternalRefName: 'Bank 1',
        ukefFacilityId: expect.any(String),
        value: null,
        submissionDate: expect.any(String),
        manualInclusionNoticeSubmissionDate: expect.any(String),
        deadlineForIssuing: expect.any(String),
        daysLeftToIssue: expect.any(Number),
        currencyAndValue: expect.any(String),
      },
    ]);
  });
  it('retrieves an empty array if the MIN date is empty', async () => {
    const updated = {
      submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN,
      submissionDate: '1639180800000',
      manualInclusionNoticeSubmissionDate: '',
    };
    // update the submissionType to MIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // update the `status` to 'Submitted'
    const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${gefDealUrl}/status/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(putResponse.status).toEqual(200);
    // ensure that the submission date has a string format - usually EPOCH
    expect(putResponse.body.submissionDate).toEqual(expect.any(String));

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if submission type is MIA', async () => {
    const updated = { submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA };
    // update the submissionType to MIA
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // update the `status` to 'Submitted'
    const putResponse = await as(aMaker).put({ status: CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF }).to(`${gefDealUrl}/status/${mockApplication.body._id}`);
    // ensure that the update was successful
    expect(putResponse.status).toEqual(200);
    // ensure that the submission date has a string format - usually EPOCH
    expect(putResponse.body.submissionDate).toEqual(expect.any(String));

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal has NOT been submitted to UKEF', async () => {
    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal has NOT been submitted to UKEF but `submissionType` is AIN', async () => {
    const updated = { submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA };
    // update the submissionType to AIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal has NOT been submitted to UKEF but `submissionType` is MIA', async () => {
    const updated = { submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA };
    // update the submissionType to AIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });

  it('retrieves an empty array if the deal has NOT been submitted to UKEF but `submissionType` is MIN', async () => {
    const updated = { submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIN };
    // update the submissionType to AIN
    const { status: submissionTypeStatus } = await as(aMaker).put(updated).to(`${gefDealUrl}/${mockApplication.body._id}`);
    // ensure that the update is successful
    expect(submissionTypeStatus).toEqual(200);

    // perform a GET request to retrieve the unissued facilities for reports
    const { status: reportsStatus, body: reportsBody } = await as(aMaker).get(unissuedFacilitiesReportUrl);
    expect(reportsStatus).toEqual(200);
    // ensure that the body has the following format:
    expect(reportsBody).toEqual([]);
  });
});
