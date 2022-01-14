const { format, fromUnixTime } = require('date-fns');
const db = require('../../../src/drivers/db-client');
const { FACILITY_TYPE } = require('../../../src/v1/gef/enums');

const {
  submissionPortalActivity,
  removeChangedToIssued,
  checkCoverDateConfirmed,
} = require('../../../src/v1/gef/controllers/application-submit');

const mockApplications = require('../../fixtures/gef/application');

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const baseUrl = '/v1/gef/facilities';
const collectionName = 'gef-facilities';

const applicationCollectionName = 'deals';
const applicationBaseUrl = '/v1/gef/application';

const MOCK_APPLICATION = mockApplications[0];
const CONSTANTS = require('../../../src/constants');

describe('submissionPortalActivity()', () => {
  it('should return a populated array with submission activity object and MIA if submission count is 0', async () => {
    /*
   As _id's can change for checker, need to access db and find a checker
   These details then added to the MOCK_APPLICATION
   */
    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION.checkerId = checker._id;
    MOCK_APPLICATION.submissionType = 'Manual Inclusion Application';
    MOCK_APPLICATION.portalActivities = [];

    const result = await submissionPortalActivity(MOCK_APPLICATION);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(1);
    // portalActivity object within array
    const portalActivityObject = result[0];

    expect(portalActivityObject.type).toEqual('NOTICE');
    // matches date as time can be off by a few seconds
    const receivedDate = format(fromUnixTime(portalActivityObject.timestamp), 'dd-MMMM-yyyy');
    const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
    expect(receivedDate).toEqual(expectedDate);

    expect(portalActivityObject.text).toEqual('');
    expect(portalActivityObject.label).toEqual('Manual inclusion application submitted to UKEF');

    // get author object from checker from db
    const author = {
      firstName: checker.firstname,
      lastName: checker.surname,
      _id: checker._id,
    };
    expect(portalActivityObject.author).toEqual(author);
  });
});

describe('removeChangedToIssued()', () => {
  let aMaker;
  let aChecker;
  let mockApplication;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
    mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    // posts facility with canResubmitIssuedFacilities as true
    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      canResubmitIssuedFacilities: true,
    }).to(baseUrl);

    const mockQuery = { dealId: mockApplication.body._id };

    const { body } = await as(aChecker).get(baseUrl, mockQuery);
    // changes to false to test
    await removeChangedToIssued(body.items[0].dealId);
  });

  it('changes canResubmitIssuedFacilities to false', async () => {
    const mockQuery = { dealId: mockApplication.body._id };

    // gets facilities from DB
    const { body } = await as(aChecker).get(baseUrl, mockQuery);

    // gets value from body for changedToIssed
    const changedToIssuedValue = body.items[0].details.canResubmitIssuedFacilities;

    expect(changedToIssuedValue).toEqual(false);
  });
});

describe('checkCoverDateConfirmed()', () => {
  it('Should return and set `coverDateConfirmed` to true with following conditions:\n\n1. AIN\n2. Have one issued facility \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      coverDateConfirmed: null,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(true);
  });

  it('Should return false and set `coverDateConfirmed` to false with following conditions:\n\n1. AIN\n2. Have one unissued facility and cover date is not true \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: false,
      coverDateConfirmed: null,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(false);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued facility \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      coverDateConfirmed: null,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(true);
  });

  it('Should return false and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one unissued facility \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: false,
      coverDateConfirmed: null,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(false);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued facility with cover date set to true \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      coverDateConfirmed: true,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(true);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued and unissued facilities with cover date set to true \n3. Not yet submitted to UKEF', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      coverDateConfirmed: true,
    }).to(baseUrl);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: false,
      coverDateConfirmed: true,
    }).to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body)).toEqual(true);
  });
});
