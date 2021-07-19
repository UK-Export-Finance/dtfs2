const wipeDB = require('../../../wipeDB');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { expectMongoIds, expectMongoId } = require('../../../expectMongoIds');

const mockUsers = [
  {
    username: 'T1_USER_1',
    email: '',
    teams: ['TEAM1'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
  },
  {
    username: 'T1_USER_2',
    email: '',
    teams: ['TEAM1'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
  },
  {
    username: 'T1_USER_3',
    email: '',
    teams: ['TEAM2'],
    timezone: 'Europe/London',
    firstName: 'Joe',
    lastName: 'Bloggs',
  },
];

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

  describe('GET /v1/tfm/users/:username', () => {
    it('404s requests for unknown usernames', async () => {
      const { status } = await api.get('/v1/tfm/users/unit-test');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      await api.post({ user: mockUsers[0] }).to('/v1/tfm/users');
      const { status, body } = await api.get(`/v1/tfm/users/${mockUsers[0].username}`);

      expect(status).toEqual(200);
      expect(body.user).toMatchObject(mockUsers[0]);
    });
  });

  describe('GET /v1/tfm/users/id/:userId', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/users/id/6040e8eff8ca8a0015355555');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const createdUserResponse = await api.post({ user: mockUsers[0] }).to('/v1/tfm/users');
      const createdUser = createdUserResponse.body;

      const { status, body } = await api.get(`/v1/tfm/users/id/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject(createdUser);
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

      const allNonDeletedUsers = mockUsers.filter((u) => u.username !== mockUsers[0].username).map((u) => u.username);
      const usernameList = listUsersRes.body.users.map((u) => u.username);
      expect(usernameList.sort()).toEqual(allNonDeletedUsers.sort());
    });
  });

  describe('GET /v1/tfm/users/team/:teamId', () => {
    it('returns all users in given team', async () => {
      await Promise.all(
        mockUsers.map(async (mockUser) => api.post({ user: mockUser }).to('/v1/tfm/users')),
      );

      const team1Users = mockUsers.filter((u) => u.teams.includes('TEAM1'));

      const { status, body } = await api.get(`/v1/tfm/users/team/${mockUsers[0].teams[0]}`);

      expect(status).toEqual(200);
      expect(body.length).toEqual(team1Users.length);

      const firstUserUsername = team1Users[0].username;
      const secondUserUsername = team1Users[1].username;

      expect(body.find((u) => u.username === firstUserUsername)).toBeDefined();
      expect(body.find((u) => u.username === secondUserUsername)).toBeDefined();
    });
  });
});
