const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');

const { as } = require('../../api')(app);

const users = require('./test-data');
const aUserWithNoRoles = users.find(user=>user.username==='NOBODY');
const aMaker = users.find(user=>user.username==='MAKER');
const aChecker = users.find(user=>user.username==='CHECKER');
const aMakerChecker = users.find(user=>user.username==='MAKENCHECK');

describe('a user', () => {

  beforeEach(async () => {
    await wipeDB.wipe(['users']);
  });

  it('a newly added user is returned when we list all users', async () => {
    await as().post(aMaker).to('/v1/users');

    const { status, body } = await as().get('/v1/users');

    expect(status).toEqual(200);
    expect(body).toEqual({
      success: true,
      count: 1,
      users: [
        {
          username: aMaker.username,
          roles: aMaker.roles,
          bank: aMaker.bank,
          _id: expect.any(String),
          firstname: aMaker.firstname,
          surname: aMaker.surname,
          timezone: 'Europe/London',
          'user-status': 'active',
        },
      ],
    });
  });

  it('a user can be updated', async () => {
    const response = await as().post(aMaker).to('/v1/users');
    const createdUser = response.body.user;

    const updatedUserCredentials = {
      roles: ['checker', 'maker'],
    };

    await as().put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

    const { status, body } = await as().get(`/v1/users/${createdUser._id}`);

    expect(status).toEqual(200);
    expect(body.roles).toEqual(['checker', 'maker']);
  });

  it('a user can be deleted', async () => {
    const response = await as().post(aMaker).to('/v1/users');
    const createdUser = response.body.user;

    await as().remove(`/v1/users/${createdUser._id}`);

    const { status, body } = await as().get(`/v1/users/${createdUser._id}`);

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('an unknown user cannot log in', async () => {
    const { username, password } = aMaker;
    const { status, body } = await as().post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a known user can log in', async () => {
    const { username, password } = aMaker;
    await as().post(aMaker).to('/v1/users');

    const { status, body } = await as().post({ username, password }).to('/v1/login');

    const expectedUserData = {
      ...aMaker,
      _id: expect.any(String),
      timezone: 'Europe/London',
      'user-status': 'active',
    };
    delete expectedUserData.password;

    expect(status).toEqual(200);
    expect(body).toEqual({
      success: true,
      token: expect.any(String),
      user: expectedUserData,
      expiresIn: '1d',
    });
  });

  it('a token can be validated', async () => {
    const { username, password } = aMaker;
    await as().post(aMaker).to('/v1/users');

    const loginResult = await as().post({ username, password }).to('/v1/login');

    const token = loginResult.body.token;

    const {status} = await as({token}).get('/v1/validate');

    expect(status).toEqual(200);
  });

  it('invalid tokens fail validation', async () => {
    const token = 'some characters i think maybe look like a token';

    const {status} = await as({token}).get('/v1/validate');

    expect(status).toEqual(401);
  });

  it('an uknown user cannot access a protected endpoint', async () => {
    const { status } = await as().get('/v1/test/protected');
    expect(status).toEqual(401);
  });

  it('a known user can access a protected endpoint', async () => {
    const { username, password } = aUserWithNoRoles;
    await as().post(aUserWithNoRoles).to('/v1/users');

    const { body } = await as().post({ username, password }).to('/v1/login');
    const { token } = body;

    const { status } = await as({token}).get('/v1/test/protected', token);
    expect(status).toEqual(200);
  });

  it('an endpoint can be blocked to users without a given role', async () => {
    const { username, password } = aChecker;
    await as().post(aChecker).to('/v1/users');

    const { body } = await as().post({ username, password }).to('/v1/login');
    const { token } = body;

    const { status } = await as({token}).get('/v1/test/protected/maker');
    expect(status).toEqual(401);
  });

  it('an endpoint can be opened to users with a given role', async () => {
    const { username, password } = aMaker;
    await as().post(aMaker).to('/v1/users');

    const { body } = await as().post({ username, password }).to('/v1/login');
    const { token } = body;

    const response = await as({token}).get('/v1/test/protected/maker');
    const { status } = response;

    expect(status).toEqual(200);
  });

  it('a user can have multiple roles', async () => {
    const { username, password } = aMakerChecker;
    await as().post(aMakerChecker).to('/v1/users');

    const { body } = await as().post({ username, password }).to('/v1/login');
    const { token } = body;

    const makerResponse = await as({token}).get('/v1/test/protected/maker');
    expect(makerResponse.status).toEqual(200);

    const checkerResponse = await as({token}).get('/v1/test/protected/checker');
    expect(makerResponse.status).toEqual(200);
  });
});
