const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');

const {
  get, post, put, remove,
} = require('../../api')(app);

describe('a user', () => {
  const newUserCredentials = {
    username: 'someone',
    password: 'some password',
    roles: [],
  };

  const updatedUserCredentials = {
    username: 'someone',
    password: 'some password',
    roles: ['checker', 'maker'],
  };

  const aMaker = {
    username: 'a maker',
    password: 'makin all day',
    roles: ['maker'],
  };

  const aChecker = {
    username: 'a checker',
    password: 'watchin u',
    roles: ['checker'],
  };

  const aMakerChecker = {
    username: 'a maker checker',
    password: 'chekin myself',
    roles: ['maker', 'checker'],
  };

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added user is returned when we list all users', async () => {
    await post(newUserCredentials).to('/v1/users');

    const { status, body } = await get('/v1/users');

    expect(status).toEqual(200);
    expect(body).toEqual({
      success: true,
      count: 1,
      users: [
        {
          username: newUserCredentials.username,
          roles: newUserCredentials.roles,
          _id: expect.any(String),
        },
      ],
    });
  });

  it('a user can be updated', async () => {
    await post(newUserCredentials).to('/v1/users');
    await put(updatedUserCredentials).to('/v1/users/someone');

    const { status, body } = await get('/v1/users/someone');

    expect(status).toEqual(200);
    expect(body).toEqual({
      username: updatedUserCredentials.username,
      roles: updatedUserCredentials.roles,
      _id: expect.any(String),
    });
  });

  it('a user can be deleted', async () => {
    await post(newUserCredentials).to('/v1/users');
    await remove('/v1/users/someone');

    const { status, body } = await get('/v1/users/someone');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('an unknown user cannot log in', async () => {
    const { username, password } = newUserCredentials;
    const { status, body } = await post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a known user can log in', async () => {
    const { username, password } = newUserCredentials;
    await post(newUserCredentials).to('/v1/users');

    const { status, body } = await post({ username, password }).to('/v1/login');

    expect(status).toEqual(200);
    expect(body).toEqual({
      success: true,
      token: expect.any(String),
      expiresIn: '1d',
    });
  });

  it('an uknown user cannot access a protected endpoint', async () => {
    const { status } = await get('/v1/test/protected');
    expect(status).toEqual(401);
  });

  it('a known user can access a protected endpoint', async () => {
    const { username, password } = newUserCredentials;
    await post(newUserCredentials).to('/v1/users');

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
