const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');

const {
  get, post, put, remove,
} = require('../../api')(app);

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
    await post(aMaker).to('/v1/users');

    const { status, body } = await get('/v1/users');

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
        },
      ],
    });
  });

  it('a user can be updated', async () => {
    await post(aMaker).to('/v1/users');

    const updatedUserCredentials = {
      ...aMaker,
      roles: ['checker', 'maker'],
    };

    await put(updatedUserCredentials).to(`/v1/users/${aMaker.username}`);

    const { status, body } = await get(`/v1/users/${aMaker.username}`);

    expect(status).toEqual(200);
    expect(body).toEqual({
      username: updatedUserCredentials.username,
      roles: updatedUserCredentials.roles,
      bank: updatedUserCredentials.bank,
      _id: expect.any(String),
    });
  });

  it('a user can be deleted', async () => {
    await post(aMaker).to('/v1/users');
    await remove('/v1/users/someone');

    const { status, body } = await get('/v1/users/someone');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('an unknown user cannot log in', async () => {
    const { username, password } = aMaker;
    const { status, body } = await post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a known user can log in', async () => {
    const { username, password } = aMaker;
    await post(aMaker).to('/v1/users');

    const { status, body } = await post({ username, password }).to('/v1/login');

    const expectedUserData = {
      ...aMaker,
      _id: expect.any(String),
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
    await post(aMaker).to('/v1/users');

    const loginResult = await post({ username, password }).to('/v1/login');

    const token = loginResult.body.token;

    const {status} = await get('/v1/validate', token);

    expect(status).toEqual(200);
  });

  it('invalid tokens fail validation', async () => {
    const token = 'some characters i think maybe look like a token';

    const {status} = await get('/v1/validate', token);

    expect(status).toEqual(401);
  });

  it('an uknown user cannot access a protected endpoint', async () => {
    const { status } = await get('/v1/test/protected');
    expect(status).toEqual(401);
  });

  it('a known user can access a protected endpoint', async () => {
    const { username, password } = aUserWithNoRoles;
    await post(aUserWithNoRoles).to('/v1/users');

    const { body } = await post({ username, password }).to('/v1/login');
    const { token } = body;

    const { status } = await get('/v1/test/protected', token);
    expect(status).toEqual(200);
  });

  it('an endpoint can be blocked to users without a given role', async () => {
    const { username, password } = aChecker;
    await post(aChecker).to('/v1/users');

    const { body } = await post({ username, password }).to('/v1/login');
    const { token } = body;

    const { status } = await get('/v1/test/protected/maker', token);
    expect(status).toEqual(401);
  });

  it('an endpoint can be opened to users with a given role', async () => {
    const { username, password } = aMaker;
    await post(aMaker).to('/v1/users');

    const { body } = await post({ username, password }).to('/v1/login');
    const { token } = body;

    const response = await get('/v1/test/protected/maker', token);
    const { status } = response;

    expect(status).toEqual(200);
  });

  it('a user can have multiple roles', async () => {
    const { username, password } = aMakerChecker;
    await post(aMakerChecker).to('/v1/users');

    const { body } = await post({ username, password }).to('/v1/login');
    const { token } = body;

    const makerResponse = await get('/v1/test/protected/maker', token);
    expect(makerResponse.status).toEqual(200);

    const checkerResponse = await get('/v1/test/protected/checker', token);
    expect(makerResponse.status).toEqual(200);
  });
});
