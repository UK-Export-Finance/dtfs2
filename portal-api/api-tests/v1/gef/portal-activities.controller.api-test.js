const { format, fromUnixTime } = require('date-fns');
const db = require('../../../src/drivers/db-client');

const {
  firstSubmissionPortalActivity,
  submissionTypeToConstant,
  getUserInfo,
  facilityChangePortalActivity,
} = require('../../../src/v1/gef/controllers/portal-activities.controller');

const { PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } = require('../../../src/v1/portalActivity-object-generator/activityConstants');

const mockApplications = require('../../fixtures/gef/application');

const MOCK_APPLICATION = mockApplications[0];
const MOCK_APPLICATION_FACILITIES = mockApplications[15];

const mockFacilities = require('../../fixtures/gef/facilities');

const CONSTANTS = require('../../../src/constants');

const wipeDB = require('../../wipeDB');

const collectionName = 'facilities';
const applicationCollectionName = 'deals';

describe('submissionPortalActivity()', () => {
  it('should return a populated array with submission activity object and MIA', async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);
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

    const result = await firstSubmissionPortalActivity(MOCK_APPLICATION);

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
  });

  it('should add to the front of the array if already populated and AIN', async () => {
    const testObject = {
      type: 'TEST',
      timestamp: 1638371667,
      author: {
        firstName: 'Tester',
        lastName: 'Test',
        _id: 12345,
      },
      text: 'Testcomment',
      label: 'Testlabel',
    };

    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION.checkerId = checker._id;
    MOCK_APPLICATION.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    MOCK_APPLICATION.portalActivities = [testObject];

    const result = await firstSubmissionPortalActivity(MOCK_APPLICATION);

    // expect to add to array so length 2
    expect(result.length).toEqual(2);

    /*
    testObject was already in portalActivities array
    ensures it is at end of array so position 1
    */
    expect(result[1]).toEqual(testObject);

    // others tested already so just ensure that message changes for AIN

    const portalActivityObject = result[0];

    expect(portalActivityObject.label).toEqual(PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION);
  });
});

describe('facilityChangePortalActivity()', () => {
  MOCK_APPLICATION_FACILITIES.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  MOCK_APPLICATION_FACILITIES.portalActivities = [];
  MOCK_APPLICATION_FACILITIES._id = '61e54dd5b578247e14575882';

  const mockFacilityOne = [mockFacilities[4]];
  const mockFacilitiesArray = [mockFacilities[4], mockFacilities[5]];

  it('should return a populated array with issued facility activity object', async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    const userCollection = await db.getCollection('users');

    const checker = await userCollection.findOne({ roles: ['checker'] });
    const maker = await userCollection.findOne({ roles: ['maker'] });

    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;

    const makerToInsert = {
      firstname: maker.firstname,
      surname: maker.surname,
      _id: maker._id,
      email: maker.email,
      roles: maker.roles
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
      _id: JSON.stringify(checker._id)
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

    expect(portalActivityObject.facilityID).toEqual(mockFacilityOne[0].ukefFacilityId);
  });

  it('should return a populated array with 2 in the issued facility activity object', async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    // resets array to length 0
    MOCK_APPLICATION_FACILITIES.portalActivities = [];

    const userCollection = await db.getCollection('users');

    const checker = await userCollection.findOne({ roles: ['checker'] });
    const maker = await userCollection.findOne({ roles: ['maker'] });

    MOCK_APPLICATION_FACILITIES.checkerId = checker._id;

    const makerToInsert = {
      firstname: maker.firstname,
      surname: maker.surname,
      _id: maker._id,
      email: maker.email,
      roles: maker.roles
    };
    MOCK_APPLICATION_FACILITIES.maker = makerToInsert;

    const result = await facilityChangePortalActivity(MOCK_APPLICATION_FACILITIES, mockFacilitiesArray);

    // ensure that only 1 object added to empty array
    expect(result.length).toEqual(2);

    // check that the first object is position 1 in mockFacilitiesArray
    const portalActivityObjectZero = result[0];
    expect(portalActivityObjectZero.facilityID).toEqual(mockFacilitiesArray[1].ukefFacilityId);

    // check that second object is position 0 in mockFacilitiesArray
    const portalActivityObjectOne = result[1];
    expect(portalActivityObjectOne.facilityID).toEqual(mockFacilitiesArray[0].ukefFacilityId);
  });
});

describe('submissionTypeToConstant()', () => {
  // checks that correct label string is returned from function
  const AIN = 'Automatic Inclusion Notice';
  const MIN = 'Manual Inclusion Notice';
  const MIA = 'Manual Inclusion Application';
  const wrong = 'AIA';

  it('should return correct AIN notice label for Automatic Inclusion Notice', () => {
    const result = submissionTypeToConstant(AIN);

    expect(result).toEqual('Automatic inclusion notice submitted to UKEF');
  });

  it('should return correct MIA notice label for Manual Inclusion Application', () => {
    const result = submissionTypeToConstant(MIA);

    expect(result).toEqual('Manual inclusion application submitted to UKEF');
  });

  it('should return correct MIN notice label for Manual Inclusion Notice', () => {
    const result = submissionTypeToConstant(MIN);

    expect(result).toEqual('Manual inclusion notice submitted to UKEF');
  });

  it('should return null label for wrong type', () => {
    const result = submissionTypeToConstant(wrong);

    expect(result).toEqual(null);
  });
});

describe('getUserInfo()', () => {
  it('should return correctly formatted userObj', async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);

    // ensures that user object returned is correctly formatted

    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });

    const returnedUser = await getUserInfo(checker._id);

    const expectedUserObject = {
      firstname: checker.firstname,
      surname: checker.surname,
      _id: checker._id,
    };

    expect(returnedUser).toEqual(expectedUserObject);
  });
});
