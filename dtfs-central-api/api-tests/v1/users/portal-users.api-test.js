const Chance = require('chance');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);

const chance = new Chance();

const newUser = {
  username: chance.name(),
  firstname: chance.first(),
  surname: chance.last(),
  email: chance.email(),
  timezone: chance.timezone().utc[0],
  roles: ['maker'],
  bank: {
    id: chance.integer(),
    name: chance.name(),
    mga: [chance.word()],
    emails: [chance.email()],
    companiesHouseNo: chance.guid(),
    partyUrn: chance.guid(),
  },
};

describe('/v1/user/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['users']);
  });

  describe('GET /v1/user/:id', () => {
    it('returns a user', async () => {
      const { body: createdUser } = await api.post(newUser).to('/v1/user');

      const { body, status } = await api.get(`/v1/user/${createdUser._id}`);

      expect(status).toEqual(200);

      const expected = {
        _id: createdUser._id,
        ...newUser,
      };

      expect(body).toEqual(expected);
    });

    it('returns 404 when there is no user', async () => {
      const { status } = await api.get('/v1/user/632f030ee8a6ce001eae355c');

      expect(status).toEqual(404);
    });

    it('returns 400 when the `_id` is invalid', async () => {
      const { status } = await api.get('/v1/user/123456');

      expect(status).toEqual(400);
    });
  });

  describe('POST /v1/user', () => {
    it('creates a user', async () => {
      const { body, status } = await api.post(newUser).to('/v1/user');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: userAfterCreation } = await api.get(`/v1/user/${body._id}`);

      expect(userAfterCreation).toEqual({
        _id: body._id,
        ...newUser,
      });
    });
  });
});
