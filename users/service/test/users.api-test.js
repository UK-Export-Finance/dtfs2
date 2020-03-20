const request = require('supertest');
const wipeDB = require('./wipeDB');
const app = require('../src/app');

const OK = 200,
      UNAUTHORIZED = 401;

describe('a user', () => {
  const aUser = {
      username: "zach",
      password: "123"
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

});
