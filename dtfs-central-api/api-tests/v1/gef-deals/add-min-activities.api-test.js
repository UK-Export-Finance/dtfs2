const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, ROLES, FACILITY_TYPE, PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('@ukef/dtfs2-common');
const { format, fromUnixTime } = require('date-fns');
const { ObjectId } = require('mongodb');

const {
  ukefSubmissionPortalActivity,
  facilityChangePortalActivity,
  portalActivityGenerator,
  getUserInfo,
  updateChangedToIssued,
} = require('../../../src/v1/controllers/portal/gef-deal/add-min-activities.controller');

const { mongoDbClient: db } = require('../../../src/drivers/db-client');

const { APPLICATION } = require('../../mocks/gef/gef-applications');
const { mockFacilities } = require('../../mocks/gef/gef-facilities');
const { DEALS } = require('../../../src/constants');

const MOCK_APPLICATION = APPLICATION[0];
const MOCK_APPLICATION_FACILITIES = APPLICATION[1];

const wipeDB = require('../../wipeDB');

const { testApi } = require('../../test-api');
const { aPortalUser } = require('../../mocks/test-users/portal-user');

const baseUrl = '/v1/portal/gef/facilities';
const applicationBaseUrl = '/v1/portal/gef/deals';

const checker = {
  ...aPortalUser(),
  roles: [ROLES.CHECKER],
  _id: new ObjectId(),
};

const maker = {
  ...aPortalUser(),
  roles: [ROLES.MAKER],
  _id: new ObjectId(),
};

beforeAll(async () => {
  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  await usersCollection.insertMany([checker, maker]);
});

describe('submissionPortalActivity()', () => {
  it('should return a populated array with submission activity object and MIA', async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS]);

    MOCK_APPLICATION.checkerId = checker._id;
    MOCK_APPLICATION.submissionType = DEALS.SUBMISSION_TYPE.MIN;
    MOCK_APPLICATION.portalActivities = [];

    const result = await ukefSubmissionPortalActivity(MOCK_APPLICATION);

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
    expect(portalActivityObject.label).toEqual(PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION);

    // get author object from checker from db
    const author = {
      firstName: checker.firstname,
      lastName: checker.surname,
      _id: checker._id,
    };
    expect(portalActivityObject.author).toEqual(author);
  });
});

describe('facilityChangePortalActivity()', () => {
  MOCK_APPLICATION_FACILITIES.submissionType = DEALS.SUBMISSION_TYPE.MIA;
  MOCK_APPLICATION_FACILITIES.portalActivities = [];
  MOCK_APPLICATION_FACILITIES._id = '61e54dd5b578247e14575882';

  const mockFacilityOne = [mockFacilities[4]];
  const mockFacilitiesArray = [mockFacilities[4], mockFacilities[5]];

  it('should return a populated array with issued facility activity object', async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS]);

    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;

    const makerToInsert = {
      firstname: maker.firstname,
      surname: maker.surname,
      _id: maker._id,
      email: maker.email,
      roles: maker.roles,
    };
    MOCK_APPLICATION_FACILITIES.maker = makerToInsert;

    const result = await facilityChangePortalActivity(MOCK_APPLICATION_FACILITIES, mockFacilityOne);

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
      firstname: checker.firstname,
      surname: checker.surname,
      _id: JSON.stringify(checker._id),
    };

    expect(portalActivityObject.checker.firstname).toEqual(checkerInObject.firstname);
    expect(portalActivityObject.checker.surname).toEqual(checkerInObject.surname);
    expect(JSON.stringify(portalActivityObject.checker._id)).toEqual(checkerInObject._id);

    // maker object matches the unissuedToIssuedByMaker
    const makerInObject = {
      firstname: mockFacilityOne[0].unissuedToIssuedByMaker.firstname,
      surname: mockFacilityOne[0].unissuedToIssuedByMaker.surname,
      _id: mockFacilityOne[0].unissuedToIssuedByMaker._id,
    };

    expect(portalActivityObject.maker).toEqual(makerInObject);

    expect(portalActivityObject.html).toEqual('facility');

    expect(portalActivityObject.facilityType).toEqual(`${mockFacilityOne[0].type} facility`);

    expect(portalActivityObject.ukefFacilityId).toEqual(mockFacilityOne[0].ukefFacilityId);

    expect(portalActivityObject.facilityId).toEqual(mockFacilityOne[0]._id);
  });

  it('should return a populated array with 2 in the issued facility activity object', async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS]);

    // resets array to length 0
    MOCK_APPLICATION_FACILITIES.portalActivities = [];

    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;

    const makerToInsert = {
      firstname: maker.firstname,
      surname: maker.surname,
      _id: maker._id,
      email: maker.email,
      roles: maker.roles,
    };
    MOCK_APPLICATION_FACILITIES.maker = makerToInsert;

    const result = await facilityChangePortalActivity(MOCK_APPLICATION_FACILITIES, mockFacilitiesArray);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(2);

    // check that the first object is position 1 in mockFacilitiesArray
    const portalActivityObjectZero = result[0];
    expect(portalActivityObjectZero.ukefFacilityId).toEqual(mockFacilitiesArray[1].ukefFacilityId);

    // check that second object is position 0 in mockFacilitiesArray
    const portalActivityObjectOne = result[1];
    expect(portalActivityObjectOne.ukefFacilityId).toEqual(mockFacilitiesArray[0].ukefFacilityId);
  });
});

describe('getUserInfo()', () => {
  it('should return correctly formatted userObj', async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS]);

    // ensures that user object returned is correctly formatted

    const returnedUser = await getUserInfo(checker._id);

    const expectedUserObject = {
      firstname: checker.firstname,
      surname: checker.surname,
      _id: checker._id,
    };

    expect(returnedUser).toEqual(expectedUserObject);
  });
});

describe('portalActivityGenerator()', () => {
  const applicationType = 'Manual Inclusion Application submitted to UKEF';
  const user = {
    firstname: 'tester',
    surname: 'testing',
    _id: 12345,
  };
  const activityType = 'NOTICE';
  const activityText = 'test123';
  const facility = {
    type: FACILITY_TYPE.CASH,
    ukefFacilityId: 123456,
    _id: 123,
  };
  const activityHTML = 'facility';

  describe('should correctly return populated object where facility defined', () => {
    const generatorObj = {
      type: applicationType,
      user,
      activityType,
      activityText,
      activityHTML,
      facility,
      checker,
      maker,
    };
    // ensures the returned object is properly generated with required fields
    const result = portalActivityGenerator(generatorObj);
    it('should correctly return type', () => {
      expect(result.type).toEqual('NOTICE');
    });

    it('should correctly return timestamp', () => {
      // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);
    });

    it('should correctly return author', () => {
      const expectedUser = {
        firstName: 'tester',
        lastName: 'testing',
        _id: 12345,
      };
      expect(result.author).toEqual(expectedUser);
    });

    it('should correctly return text', () => {
      expect(result.text).toEqual('test123');
    });

    it('should correctly return label', () => {
      expect(result.label).toEqual('Manual Inclusion Application submitted to UKEF');
    });

    it('should correctly return html', () => {
      expect(result.html).toEqual('facility');
    });

    it('should correctly return maker', () => {
      expect(result.maker).toEqual(maker);
    });

    it('should correctly return checker', () => {
      expect(result.checker).toEqual(checker);
    });

    it('should correctly return type', () => {
      expect(result.facilityType).toEqual('Cash facility');
    });

    it('should correctly return ukefFacilityId', () => {
      expect(result.ukefFacilityId).toEqual(123456);
    });

    it('should correctly return facilityId', () => {
      expect(result.facilityId).toEqual(123);
    });
  });

  describe('should correctly return populated object where facility undefined', () => {
    const generatorObj = {
      type: applicationType,
      user,
      activityType,
      activityText,
      activityHTML,
      facility: null,
      checker,
      maker,
    };
    // ensures the returned object is properly generated with required fields
    const result = portalActivityGenerator(generatorObj);
    it('should correctly return type', () => {
      expect(result.type).toEqual('NOTICE');
    });

    it('should correctly return timestamp', () => {
      // matches date as timestamps may be seconds off
      const receivedDate = format(fromUnixTime(result.timestamp), 'dd-MMMM-yyyy');
      const expectedDate = format(new Date(), 'dd-MMMM-yyyy');
      expect(receivedDate).toEqual(expectedDate);
    });

    it('should correctly return author', () => {
      const expectedUser = {
        firstName: 'tester',
        lastName: 'testing',
        _id: 12345,
      };
      expect(result.author).toEqual(expectedUser);
    });

    it('should correctly return text', () => {
      expect(result.text).toEqual('test123');
    });

    it('should correctly return label', () => {
      expect(result.label).toEqual('Manual Inclusion Application submitted to UKEF');
    });

    it('should correctly return html', () => {
      expect(result.html).toEqual('facility');
    });

    it('should correctly return maker', () => {
      expect(result.maker).toEqual(maker);
    });

    it('should correctly return checker', () => {
      expect(result.checker).toEqual(checker);
    });

    it('should correctly return facilityType', () => {
      expect(result.facilityType).toEqual('');
    });

    it('should correctly return ukefFacilityId', () => {
      expect(result.ukefFacilityId).toEqual('');
    });

    it('should correctly return facilityId', () => {
      expect(result.facilityId).toEqual('');
    });
  });
});

describe('updateChangedToIssued()', () => {
  let mockApplication;
  let auditDetails;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS]);
    mockApplication = await testApi.post(APPLICATION[0]).to(applicationBaseUrl);
    await testApi.put(APPLICATION[0]).to(`${applicationBaseUrl}/${mockApplication.body._id}`);
    auditDetails = generatePortalAuditDetails(new ObjectId());
  });

  beforeEach(async () => {
    // posts facility with canResubmitIssuedFacilities as true
    await testApi
      .post({
        dealId: mockApplication.body._id,
        type: FACILITY_TYPE.CASH,
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
      })
      .to(baseUrl);

    const mockQuery = { dealId: mockApplication.body._id };

    const { body } = await testApi.get(baseUrl, mockQuery);

    // changes to false to test
    await updateChangedToIssued({ facilities: body, auditDetails });
  });

  it('changes canResubmitIssuedFacilities to false', async () => {
    const mockQuery = { dealId: mockApplication.body._id };

    // gets facilities from DB
    const { body } = await testApi.get(baseUrl, mockQuery);

    // gets value from body for changedToIssued
    const changedToIssuedValue = body[0].canResubmitIssuedFacilities;

    expect(changedToIssuedValue).toEqual(false);
  });
});
