const wipeDB = require('../../../wipeDB');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { expectMongoIds, expectMongoId } = require('../../../expectMongoIds');

const mockUsers = [{
  username: 'T1_USER_1',
  email: '',
  teams: ['TEAM1'],
  timezone: 'Europe/London',
},
{
  username: 'T1_USER_2',
  email: '',
  teams: ['TEAM1'],
  timezone: 'Europe/London',
}];

const orderUsers = (users) => users.sort((u1, u2) => (u1.username.localeCompare(u2.username)));

describe('/v1/tfm/users', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['tfm-users']);
  });

  describe('POST /v1/tfm/users', () => {
    it('returns the created resource', async () => {
      const { status, body } = await api.post({ user: mockUsers[0] }).to('/v1/tfm/users');

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(mockUsers[0]));
    });
  });

  describe('GET /v1/tfm/users', () => {
    it('returns all users', async () => {
      await Promise.all(
        mockUsers.map(async (mockUser) => api.post({ user: mockUser }).to('/v1/tfm/users')),
      );
      const { status, body } = await api.get('/v1/tfm/users');
      expect(status).toEqual(200);
      expect(orderUsers(body.users)).toMatchObject(orderUsers(expectMongoIds(mockUsers)));
    });
  });

  describe('GET /v1/tfm/users/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/users/12345678910');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      await api.post({ user: mockUsers[0] }).to('/v1/tfm/users');
      const { status, body } = await api.get(`/v1/tfm/users/${mockUsers[0].username}`);

      expect(status).toEqual(200);
      expect(body.user).toMatchObject(mockUsers[0]);
    });
  });

  describe('DELETE /v1/tfm/users/:id', () => {
    it('deletes the user', async () => {
      await Promise.all(
        mockUsers.map(async (mockUser) => api.post({ user: mockUser }).to('/v1/tfm/users')),
      );

      const { status, body } = await api.remove().to(`/v1/tfm/users/${mockUsers[0].username}`);

      expect(status).toEqual(200);
      expect(body.deletedCount).toEqual(1);

      const listUsersRes = await api.get('/v1/tfm/users');
      expect(listUsersRes.body.users).toEqual(expectMongoIds([mockUsers[1]]));
    });
  });
});
