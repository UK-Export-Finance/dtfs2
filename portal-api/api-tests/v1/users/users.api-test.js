const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');

const { as } = require('../../api')(app);

const users = require('./test-data');

const aMaker = users.find((user) => user.username === 'MAKER');

const PASSWORD_ERROR = { text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.' };
const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };

describe('a user', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['users']);
  });

  describe('creating a user:', () => {
    it('rejects if the provided password contains zero numeric characters', async () => {
      const myMaker = {
        ...aMaker,
        password: 'sdgkjbsdgkjbsdgkjdskj',
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero upper-case characters', async () => {
      const myMaker = {
        ...aMaker,
        password: 'sdgkjbsdgkjbsdgkjdskj',
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero lower-case characters', async () => {
      const myMaker = {
        ...aMaker,
        password: 'SDGASDFGHSDKGNL',
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero special characters', async () => {
      const myMaker = {
        ...aMaker,
        password: 'SDGASDFGHSDKGNL',
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains fewer than 8 characters', async () => {
      const myMaker = {
        ...aMaker,
        password: '1234567',
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided email address is not in valid format', async () => {
      const myMaker = {
        ...aMaker,
        email: 'abc'
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('rejects if the provided email address is empty', async () => {
      const myMaker = {
        ...aMaker,
        email: ''
      };

      const { status, body } = await as().post(myMaker).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('creates the user if all provided data is valid', async () => {
      await as().post(aMaker).to('/v1/users');
      const { status, body } = await as().get('/v1/users');

      expect(status).toEqual(200);
      expect(body).toEqual({
        success: true,
        count: 1,
        users: [
          {
            username: aMaker.username,
            email: aMaker.email,
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

  it('a user can be disabled', async () => {
    const response = await as().post(aMaker).to('/v1/users');
    const createdUser = response.body.user;

    await as().remove(`/v1/users/${createdUser._id}/disable`);

    const { status, body } = await as().get(`/v1/users/${createdUser._id}`);

    expect(status).toEqual(200);
    expect(body).toMatchObject({
      disabled: true,
    });
  });

  it('an unknown user cannot log in', async () => {
    const { username, password } = aMaker;
    const { status } = await as().post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a disabled user cannot log in', async () => {
    const response = await as().post(aMaker).to('/v1/users');
    const createdUser = response.body.user;
    await as().remove(`/v1/users/${createdUser._id}`);

    const { username, password } = aMaker;
    const { status } = await as().post({ username, password }).to('/v1/login');

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
      expiresIn: '12h',
    });
  });

  it('a token can be validated', async () => {
    const { username, password } = aMaker;
    await as().post(aMaker).to('/v1/users');

    const loginResult = await as().post({ username, password }).to('/v1/login');

    const { token } = loginResult.body;

    const { status } = await as({ token }).get('/v1/validate');

    expect(status).toEqual(200);
  });

  it('invalid tokens fail validation', async () => {
    const token = 'some characters i think maybe look like a token';

    const { status } = await as({ token }).get('/v1/validate');

    expect(status).toEqual(401);
  });

  it('User already exists', async () => {
    // User creation - first instance
    const first = await as().post(aMaker).to('/v1/users');
    expect(first.status).toEqual(200);

    // User creation - second instance
    const second = await as().post(aMaker).to('/v1/users');
    expect(second.status).toEqual(400);
  });

  describe('NoSQL injection attempts', () => {
    const expectedBody = { msg: 'could not find user', success: false };

    const injectedUserVariables = {
      password: '1!aB5678',
      firstname: 'Injected',
      surname: 'Test',
      roles: ['maker', 'checker'],
      bank: {
        id: '961',
        name: 'HSBC',
      }
    };

    describe('when username is "{ "$ne": "" }"', () => {
      it('should return a user cannot be found message', async () => {
        const injectedUser = {
          username: '{ "$ne": "" }',
          email: '{ "$ne": "" }',
          ...injectedUserVariables,
        };

        const { username, password } = injectedUser;
        await as().post(injectedUser).to('/v1/users');

        const { status, body } = await as().post({ username, password }).to('/v1/login');

        expect(status).toEqual(401);
        expect(body).toEqual(expectedBody);
      });
    });

    describe('when username is "{ "$gt": "" }"', () => {
      it('should return a user cannot be found message', async () => {
        const injectedUser = {
          username: '{ "$gt": "" }',
          email: '{ "$gt": "" }',
          ...injectedUserVariables,
        };

        const { username, password } = injectedUser;
        await as().post(injectedUser).to('/v1/users');

        const { status, body } = await as().post({ username, password }).to('/v1/login');

        expect(status).toEqual(401);
        expect(body).toEqual(expectedBody);
      });

      describe('when username is "{ "$lt": "" }"', () => {
        it('should return a user cannot be found message', async () => {
          const injectedUser = {
            username: '{ "$lt": "" }',
            email: '{ "$lt": "" }',
            ...injectedUserVariables,
          };

          const { username, password } = injectedUser;
          await as().post(injectedUser).to('/v1/users');

          const { status, body } = await as().post({ username, password }).to('/v1/login');

          expect(status).toEqual(401);
          expect(body).toEqual(expectedBody);
        });
      });
    });
  });
});
