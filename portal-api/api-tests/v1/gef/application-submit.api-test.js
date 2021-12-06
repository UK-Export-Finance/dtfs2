const { format, fromUnixTime } = require('date-fns');
const db = require('../../../src/drivers/db-client');
const { submissionPortalActivity, submissionTypeToConstant, getUserInfo } = require('../../../src/v1/gef/controllers/application-submit');
const mockApplications = require('../../fixtures/gef/application');

const MOCK_APPLICATION = mockApplications[0];

describe('submissionPortalActivity()', () => {
  it('should return a populated array with submission activity object and MIA', async () => {
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

    const userCollection = await db.getCollection('users');
    // finds someone with role checker only
    const checker = await userCollection.findOne({ roles: ['checker'] });
    MOCK_APPLICATION.checkerId = checker._id;
    MOCK_APPLICATION.submissionType = 'Automatic Inclusion Notice';
    MOCK_APPLICATION.portalActivities = [testObject];

    const result = await submissionPortalActivity(MOCK_APPLICATION);

    // expect to add to array so length 2
    expect(result.length).toEqual(2);

    /*
    testObject was already in portalActivities array
    ensures it is at end of array so position 1
    */
    expect(result[1]).toEqual(testObject);

    // others tested already so just ensure that message changes for AIN

    const portalActivityObject = result[0];

    expect(portalActivityObject.label).toEqual('Automatic inclusion notice submitted to UKEF');
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
