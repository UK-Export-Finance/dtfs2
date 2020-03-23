const request = require('supertest');
const wipeDB = require('./wipeDB');
const app = require('../src/app');

const OK = 200;
const UNAUTHORIZED = 401;

describe('a user', () => {
  const aUser = {
    username: 'zach',
    password: '123',
    roles: [],
  };

  const aMaker = {
    username: 'some maker',
    password: 'bananas',
    roles: ['maker'],
  };

  const aChecker = {
    username: 'some checker',
    password: 'kartoffelkopf',
    roles: ['checker'],
  };

  const aMakerAndChecker = {
    username: 'some checker',
    password: 'kartoffelkopf',
    roles: ['checker', 'maker'],
  };

  beforeEach(async () => {
    await wipeDB();
  });

  it('an unknown user cannot log in', async () => {
    await request(app).post('/users/login')
      .send(aUser)
      .expect(UNAUTHORIZED);
  });

  it('a user can be registered', async () => {
    const registerResponse = await request(app)
      .post('/users/register')
      .send(aUser)
      .expect(OK);

    expect(registerResponse.body).toEqual({
      success: true,
      user: {
        username: aUser.username,
        roles: aUser.roles,
        _id: expect.any(String),
      },
    });
  });

  it('a newly registered user can log in', async () => {
    await request(app)
      .post('/users/register')
      .send(aUser)
      .expect(OK);

    const loginResponse = await request(app)
      .post('/users/login')
      .send(aUser)
      .expect(OK);

    expect(loginResponse.body).toEqual({
      success: true,
      token: expect.any(String),
      expiresIn: '1d',
    });
  });

  it('restricted areas cannot be visited without a suitable Authorization token', async () => {
    const token = 'some nonsense';

    await request(app)
      .get('/users/protected')
      .set('Authorization', token)
      .expect(UNAUTHORIZED);
  });

  it('successful login yields a token that allows access to restricted areas..', async () => {
    await request(app)
      .post('/users/register')
      .send(aUser)
      .expect(OK);

    const loginResponse = await request(app)
      .post('/users/login')
      .send(aUser)
      .expect(OK);

    const { token } = loginResponse.body;

    await request(app)
      .get('/users/protected')
      .set('Authorization', token)
      .expect(OK);
  });

  it('users can be blocked from endpoint on the basis of their role', async () => {
    await request(app)
      .post('/users/register')
      .send(aMaker)
      .expect(OK);

    const loginResponse = await request(app)
      .post('/users/login')
      .send(aMaker)
      .expect(OK);

    const { token } = loginResponse.body;

    await request(app)
      .get('/users/protected/checker')
      .set('Authorization', token)
      .expect(UNAUTHORIZED);
  });

  it('users can be granted access to an endpoint on the basis of their role', async () => {
    await request(app)
      .post('/users/register')
      .send(aChecker)
      .expect(OK);

    const loginResponse = await request(app)
      .post('/users/login')
      .send(aChecker)
      .expect(OK);

    const { token } = loginResponse.body;

    await request(app)
      .get('/users/protected/checker')
      .set('Authorization', token)
      .expect(OK);
  });

  it('users can have multiple roles', async () => {
    await request(app)
      .post('/users/register')
      .send(aMakerAndChecker)
      .expect(OK);

    const loginResponse = await request(app)
      .post('/users/login')
      .send(aMakerAndChecker)
      .expect(OK);

    const { token } = loginResponse.body;

    await request(app)
      .get('/users/protected/maker')
      .set('Authorization', token)
      .expect(OK);

    await request(app)
      .get('/users/protected/checker')
      .set('Authorization', token)
      .expect(OK);
  });
});
