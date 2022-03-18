const { format, fromUnixTime } = require('date-fns');
const db = require('../../../src/drivers/db-client');
const { FACILITY_TYPE } = require('../../../src/v1/gef/enums');

const {
  submissionPortalActivity,
  updateChangedToIssued,
  checkCoverDateConfirmed,
  addSubmissionDateToIssuedFacilities
} = require('../../../src/v1/gef/controllers/application-submit');

const {
  update: updateFacility,
  getAllFacilitiesByDealId
} = require('../../../src/v1/gef/controllers/facilities.controller');

const mockApplications = require('../../fixtures/gef/application');

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const baseUrl = '/v1/gef/facilities';
const facilitiesCollectionName = 'facilities';

const dealsCollectionName = 'deals';
const applicationBaseUrl = '/v1/gef/application';

const MOCK_APPLICATION = mockApplications[0];
const MOCK_APPLICATION_FACILITIES = mockApplications[15];
const CONSTANTS = require('../../../src/constants');

const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../src/v1/portalActivity-object-generator/activityConstants');

const mockFacilities = require('../../fixtures/gef/facilities');

describe('submissionPortalActivity()', () => {
  it('should return a populated array with submission activity object and MIA if submission count is 0', async () => {
    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);
    /*
   As _id's can change for checker, need to access db and find a checker
   These details then added to the MOCK_APPLICATION
   */
    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION.checkerId = checker._id;
    MOCK_APPLICATION.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
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

    expect(portalActivityObject.label).toEqual(PORTAL_ACTIVITY_LABEL.MIA_SUBMISSION);

    // get author object from checker from db
    const author = {
      firstName: checker.firstname,
      lastName: checker.surname,
      _id: checker._id,
    };
    expect(portalActivityObject.author).toEqual(author);

    expect(portalActivityObject.html).toEqual('');

    expect(portalActivityObject.facilityType).toEqual('');

    expect(portalActivityObject.ukefFacilityId).toEqual('');
  });

  it('should not return a populated array with facility changed if submission count above 1 and facility changed to issued and MIA', async () => {
    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();

    /*
   As _id's can change for checker, need to access db and find a checker
   These details then added to the MOCK_APPLICATION
   */
    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;
    MOCK_APPLICATION_FACILITIES.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    MOCK_APPLICATION_FACILITIES.portalActivities = [];
    MOCK_APPLICATION_FACILITIES._id = '61e54dd5b578247e14575882';

    const req = {
      body: {
        type: 'Cash',
        dealId: MOCK_APPLICATION_FACILITIES._id,
        paymentType: 'IN_ARREARS_MONTHLY'
      }
    };

    const res = await as(aMaker).post(req.body).to(baseUrl);

    await updateFacility(res.body.details._id, mockFacilities[4]);

    const result = await submissionPortalActivity(MOCK_APPLICATION_FACILITIES);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(0);
  });

  it('should return a populated array with facility changed if submission count above 1 and facility changed to issued and AIN', async () => {
    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    const aChecker = testUsers().withRole('checker').one();
    /*
   As _id's can change for checker, need to access db and find a checker
   These details then added to the MOCK_APPLICATION
   */
    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;
    MOCK_APPLICATION_FACILITIES.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    MOCK_APPLICATION_FACILITIES.portalActivities = [];
    MOCK_APPLICATION_FACILITIES._id = '61e54dd5b578247e14575882';

    const req = {
      body: {
        type: 'Cash',
        dealId: MOCK_APPLICATION_FACILITIES._id,
        paymentType: 'IN_ARREARS_MONTHLY'
      }
    };

    const res = await as(aMaker).post(req.body).to(baseUrl);

    await updateFacility(res.body.details._id, mockFacilities[4]);

    const result = await submissionPortalActivity(MOCK_APPLICATION_FACILITIES);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(1);

    // portalActivity object within array
    const portalActivityObject = result[0];

    expect(portalActivityObject.type).toEqual(PORTAL_ACTIVITY_TYPE.FACILITY_STAGE);

    // matches date as time can be off by a few seconds
    const receivedDate = format(fromUnixTime(portalActivityObject.timestamp), 'dd-MMMM-yyyy');
    const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
    expect(receivedDate).toEqual(expectedDate);

    expect(portalActivityObject.text).toEqual('');

    expect(portalActivityObject.label).toEqual(PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED);

    // author should be undefined
    const author = {
      firstName: undefined,
      lastName: undefined,
      _id: undefined,
    };
    expect(portalActivityObject.author).toEqual(author);

    // checker object - checks matches test checker
    const checkerInObject = {
      firstname: aChecker.firstname,
      surname: aChecker.surname,
      _id: JSON.stringify(aChecker._id)
    };

    expect(portalActivityObject.checker.firstname).toEqual(checkerInObject.firstname);
    expect(portalActivityObject.checker.surname).toEqual(checkerInObject.surname);
    expect(JSON.stringify(portalActivityObject.checker._id)).toEqual(checkerInObject._id);

    expect(portalActivityObject.html).toEqual('facility');

    expect(portalActivityObject.facilityType).toEqual(`${req.body.type} facility`);

    expect(portalActivityObject.ukefFacilityId).toEqual(mockFacilities[4].ukefFacilityId);
  });
});

describe('updateChangedToIssued()', () => {
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
    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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
    await updateChangedToIssued(body.items[0].dealId);
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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);

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

describe.only('addSubmissionDateToIssuedFacilities()', () => {
  it('', async () => {
    const testUsers = await testUserCache.initialise(app);
    const aMaker = testUsers().withRole('maker').one();
    // await wipeDB.wipe([facilitiesCollectionName]);
    // await wipeDB.wipe([dealsCollectionName]);

    const mockAIN = mockApplications[0];
    let mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);

    await as(aMaker).post({
      dealId: mockApplication.body._id,
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      shouldCoverStartOnSubmission: true,
      hasBeenIssuedAndAcknowledged: null
    }).to(baseUrl);

    const facility = await getAllFacilitiesByDealId(mockApplication.body._id);

    await updateFacility(facility[0]._id, {
      hasBeenIssued: true,
      shouldCoverStartOnSubmission: true,
      hasBeenIssuedAndAcknowledged: null
    });

    await addSubmissionDateToIssuedFacilities(mockApplication.body._id);

    const updatedFacility = await getAllFacilitiesByDealId(mockApplication.body._id);

    console.log('updatedddddd', updatedFacility);
  });
});
