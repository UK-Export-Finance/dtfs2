const request = require('supertest');
const wipeDB = require('./wipeDB');
const app = require('../src/app');

const OK = 200,
      UNAUTHORIZED = 401;

describe('a user', () => {
  const aUser = {
      username: "zach",
      password: "123",
      roles: []
  }

  const aMaker = {
      username: "some maker",
      password: "bananas",
      roles: ['maker']
  }

  const aChecker = {
      username: "some checker",
      password: "kartoffelkopf",
      roles: ['checker']
  }

  const aMakerAndChecker = {
    username: "some checker",
    password: "kartoffelkopf",
    roles: ['checker', 'maker']
  }

  beforeEach(async () => {
    await wipeDB();
  });

  it('an unknown user cannot log in', async () => {

    const loginResponse = await request(app).post("/users/login")
      .send(aUser)
      .expect(UNAUTHORIZED) //unauthorised
  });

  it('a newly registered user can log in', async () => {
    const registerResponse = await request(app)
      .post("/users/register")
      .send(aUser)
      .expect(OK)

    const loginResponse = await request(app)
      .post("/users/login")
      .send(aUser)
      .expect(OK)
  });

  it('restricted areas cannot be visited without a suitable Authorization token', async () => {
    const token = "some nonsense";

    const navigationResponse = await request(app)
      .get("/users/protected")
      .set('Authorization', token)
      .expect(UNAUTHORIZED)

  });

  it('successful login yields a token that allows access to restricted areas..', async () => {
    const registerResponse = await request(app)
      .post("/users/register")
      .send(aUser)
      .expect(OK)

    const loginResponse = await request(app)
      .post("/users/login")
      .send(aUser)
      .expect(OK)

    const token = loginResponse.body.token;

    const navigationResponse = await request(app)
      .get("/users/protected")
      .set('Authorization', token)
      .expect(OK)

  });

  it('users can be blocked from endpoint on the basis of their role', async () => {
    await request(app)
      .post("/users/register")
      .send(aMaker)
      .expect(OK)

    const loginResponse = await request(app)
      .post("/users/login")
      .send(aMaker)
      .expect(OK)

    const token = loginResponse.body.token;

    await request(app)
      .get("/users/protected/checker")
      .set('Authorization', token)
      .expect(UNAUTHORIZED)

  });

  it('users can be granted access to an endpoint on the basis of their role', async () => {
    await request(app)
      .post("/users/register")
      .send(aMaker)
      .expect(OK)

    const loginResponse = await request(app)
      .post("/users/login")
      .send(aMaker)
      .expect(OK)

    const token = loginResponse.body.token;

    await request(app)
      .get("/users/protected/maker")
      .set('Authorization', token)
      .expect(OK)

  });

  it('users can have multiple roles', async () => {
    await request(app)
      .post("/users/register")
      .send(aMakerAndChecker)
      .expect(OK)

    const loginResponse = await request(app)
      .post("/users/login")
      .send(aMakerAndChecker)
      .expect(OK)

    const token = loginResponse.body.token;

    await request(app)
      .get("/users/protected/maker")
      .set('Authorization', token)
      .expect(OK)

    await request(app)
      .get("/users/protected/checker")
      .set('Authorization', token)
      .expect(OK)

  });
});
