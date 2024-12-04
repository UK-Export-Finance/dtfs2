const { format, fromUnixTime } = require('date-fns');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE, PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const {
  submissionPortalActivity,
  updateChangedToIssued,
  checkCoverDateConfirmed,
  addSubmissionDateToIssuedFacilities,
} = require('../../../src/v1/gef/controllers/application-submit');
const { update: updateFacility, getAllFacilitiesByDealId } = require('../../../src/v1/gef/controllers/facilities.controller');
const convertToTimestamp = require('../../../src/v1/helpers/convertToTimestamp');
const mockApplications = require('../../fixtures/gef/application');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');
const mockFacilities = require('../../fixtures/gef/facilities');
const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

const baseUrl = '/v1/gef/facilities';
const applicationBaseUrl = '/v1/gef/application';

describe('submissionPortalActivity()', () => {
  let MOCK_APPLICATION;
  let MOCK_APPLICATION_FACILITIES;
  let aMaker;
  let aChecker;
  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.DEALS]);

    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
    aChecker = testUsers().withRole(CHECKER).one();

    MOCK_APPLICATION = { ...mockApplications[0], checkerId: aChecker._id, portalActivities: [], submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA };
    MOCK_APPLICATION_FACILITIES = { ...mockApplications[15], checkerId: aChecker._id, portalActivities: [] };
  });

  it('should return a populated array with submission activity object and MIA if submission count is 0', async () => {
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
      firstName: aChecker.firstname,
      lastName: aChecker.surname,
      _id: aChecker._id,
    };
    expect(portalActivityObject.author).toEqual(author);

    expect(portalActivityObject.html).toEqual('');

    expect(portalActivityObject.facilityType).toEqual('');

    expect(portalActivityObject.ukefFacilityId).toEqual('');
  });

  it('should not return a populated array with facility changed if submission count above 1 and facility changed to issued and MIA', async () => {
    MOCK_APPLICATION_FACILITIES.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    MOCK_APPLICATION_FACILITIES._id = '61e54dd5b578247e14575882';

    const { status: dealStatus, body: dealBody } = await as(aMaker).post(MOCK_APPLICATION_FACILITIES).to(applicationBaseUrl);

    expect(dealStatus).toEqual(201);

    const req = {
      body: {
        type: 'Cash',
        dealId: dealBody._id,
        paymentType: 'IN_ARREARS_MONTHLY',
      },
    };

    const res = await as(aMaker).post(req.body).to(baseUrl);

    await updateFacility(res.body.details._id, mockFacilities[4], generatePortalAuditDetails(aMaker._id));

    const result = await submissionPortalActivity(MOCK_APPLICATION_FACILITIES);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(0);
  });

  it('should return a populated array with facility changed if submission count above 1 and facility changed to issued and AIN', async () => {
    MOCK_APPLICATION_FACILITIES.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    delete MOCK_APPLICATION_FACILITIES._id;

    const { status: dealStatus, body: dealBody } = await as(aMaker).post(MOCK_APPLICATION_FACILITIES).to(applicationBaseUrl);

    expect(dealStatus).toEqual(201);

    const req = {
      body: {
        type: 'Cash',
        dealId: dealBody._id,
        paymentType: 'IN_ARREARS_MONTHLY',
      },
    };

    const res = await as(aMaker).post(req.body).to(baseUrl);

    await updateFacility(res.body.details._id, mockFacilities[4], generatePortalAuditDetails(aMaker._id));

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
      _id: JSON.stringify(aChecker._id),
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
    aMaker = testUsers().withRole(MAKER).one();
    aChecker = testUsers().withRole(CHECKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.DEALS]);

    mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
    // posts facility with canResubmitIssuedFacilities as true
    await as(aMaker)
      .post({
        dealId: mockApplication.body._id,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
      })
      .to(baseUrl);

    const mockQuery = { dealId: mockApplication.body._id };

    const { body } = await as(aChecker).get(baseUrl, mockQuery);
    // changes to false to test
    await updateChangedToIssued(body.items[0].dealId, generatePortalAuditDetails(aMaker._id));
  });

  it('changes canResubmitIssuedFacilities to false', async () => {
    const mockQuery = { dealId: mockApplication.body._id };

    // gets facilities from DB
    const { body } = await as(aChecker).get(baseUrl, mockQuery);

    // gets value from body for changedToIssued
    const changedToIssuedValue = body.items[0].details.canResubmitIssuedFacilities;

    expect(changedToIssuedValue).toEqual(false);
  });
});

describe('checkCoverDateConfirmed()', () => {
  const mockAIN = mockApplications[0];
  let aMaker;
  let mockApplicationId;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.DEALS]);

    const { body: applicationBody } = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplicationId = applicationBody._id;
  });

  it('Should return and set `coverDateConfirmed` to true with following conditions:\n\n1. AIN\n2. Have one issued facility \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        coverDateConfirmed: null,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(true);
  });

  it('Should return false and set `coverDateConfirmed` to false with following conditions:\n\n1. AIN\n2. Have one unissued facility and cover date is not true \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: false,
        coverDateConfirmed: null,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(false);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued facility \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        coverDateConfirmed: null,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(true);
  });

  it('Should return false and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one unissued facility \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: false,
        coverDateConfirmed: null,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(false);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued facility with cover date set to true \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        coverDateConfirmed: true,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(true);
  });

  it('Should return true and set `coverDateConfirmed` to false with following conditions:\n\n1. MIA\n2. Have one issued and unissued facilities with cover date set to true \n3. Not yet submitted to UKEF', async () => {
    const mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplicationId}`);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        coverDateConfirmed: true,
      })
      .to(baseUrl);

    await as(aMaker)
      .post({
        dealId: mockApplicationId,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: false,
        coverDateConfirmed: true,
      })
      .to(baseUrl);

    expect(await checkCoverDateConfirmed(mockApplication.body, generatePortalAuditDetails(aMaker._id))).toEqual(true);
  });
});

describe('addSubmissionDateToIssuedFacilities()', () => {
  let aMaker;
  let mockApplication;
  const mockAIN = mockApplications[0];

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.DEALS]);

    mockApplication = await as(aMaker).post(mockAIN).to(applicationBaseUrl);
    mockApplication = await as(aMaker).put({ submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.MIA }).to(`${applicationBaseUrl}/${mockApplication.body._id}`);
  });

  it('if facility hasBeenIssued but not hasBeenIssuedAndAcknowledged then should add coverStartDate and submittedAsIssuedDate', async () => {
    await as(aMaker)
      .post({
        dealId: mockApplication.body._id,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        shouldCoverStartOnSubmission: true,
        hasBeenIssuedAndAcknowledged: null,
      })
      .to(baseUrl);

    const facility = await getAllFacilitiesByDealId(mockApplication.body._id);

    // updates facility and sets flags
    await updateFacility(
      facility[0]._id,
      {
        hasBeenIssued: true,
        shouldCoverStartOnSubmission: true,
        hasBeenIssuedAndAcknowledged: null,
      },
      generatePortalAuditDetails(aMaker._id),
    );

    await addSubmissionDateToIssuedFacilities(mockApplication.body._id, generatePortalAuditDetails(aMaker._id));

    // gets facilities from collection
    const updatedFacility = await getAllFacilitiesByDealId(mockApplication.body._id);

    const expectedCoverStartDate = new Date().setHours(0, 0, 0, 0);
    // expect both to have been set
    expect(updatedFacility[0].coverStartDate).toEqual(new Date(convertToTimestamp(expectedCoverStartDate)));
    expect(updatedFacility[0].submittedAsIssuedDate).toEqual(expect.any(String));
  });

  it('if facility hasBeenIssued and hasBeenIssuedAndAcknowledged then should not override coverStartDate or submittedAsIssuedDate', async () => {
    await as(aMaker)
      .post({
        dealId: mockApplication.body._id,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        shouldCoverStartOnSubmission: true,
        hasBeenIssuedAndAcknowledged: null,
      })
      .to(baseUrl);

    const facility = await getAllFacilitiesByDealId(mockApplication.body._id);

    // sets both flags to true
    await updateFacility(
      facility[0]._id,
      {
        hasBeenIssued: true,
        shouldCoverStartOnSubmission: true,
        hasBeenIssuedAndAcknowledged: true,
      },
      generatePortalAuditDetails(aMaker._id),
    );

    await addSubmissionDateToIssuedFacilities(mockApplication.body._id, generatePortalAuditDetails(aMaker._id));

    // gets facilities from collection
    const updatedFacility = await getAllFacilitiesByDealId(mockApplication.body._id);

    // should be null as both should not be overwritten
    expect(updatedFacility[0].coverStartDate).toBeNull();
    expect(updatedFacility[0].submittedAsIssuedDate).toBeNull();
  });
});
