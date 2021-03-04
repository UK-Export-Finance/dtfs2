const wipeDB = require('../../../wipeDB');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);

const { expectMongoIds } = require('../../../expectMongoIds');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const mockTeams = [{
  id: 'TEAM1',
  name: 'Mock Team 1',
}, {
  id: 'TEAM2',
  name: 'Mock Team 2',
}];

const orderTeams = (teams) => teams.sort((t1, t2) => (t1.id.localeCompare(t2.id)));

describe('/v1/tfm/teams', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['tfm-teams']);
  });

  describe('POST /v1/tfm/teams', () => {
    it('returns the created resource', async () => {
      const { status, body } = await api.post({ team: mockTeams[0] }).to('/v1/tfm/teams');

      expect(status).toEqual(200);
      expect(body).toMatchObject(mockTeams[0]);
    });
  });

  describe('GET /v1/tfm/teams', () => {
    it('returns all teams', async () => {
      await Promise.all(
        mockTeams.map(async (mockTeam) => api.post({ team: mockTeam }).to('/v1/tfm/teams')),
      );
      const { status, body } = await api.get('/v1/tfm/teams');
      expect(status).toEqual(200);
      expect(orderTeams(body.teams)).toEqual(orderTeams(expectMongoIds(mockTeams)));
    });
  });

  describe('GET /v1/tfm/teams/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/teams/12345678910');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post({ team: mockTeams[0] }).to('/v1/tfm/teams');

      const teamId = postResult.body.id;

      const { status, body } = await api.get(`/v1/tfm/teams/${teamId}`);

      expect(status).toEqual(200);
      expect(body.team).toMatchObject(mockTeams[0]);
    });
  });

  describe('DELETE /v1/tfm/teams/:id', () => {
    it('deletes the team', async () => {
      await Promise.all(
        mockTeams.map(async (mockTeam) => api.post({ team: mockTeam }).to('/v1/tfm/teams')),
      );

      const { status, body } = await api.remove().to(`/v1/tfm/teams/${mockTeams[0].id}`);

      expect(status).toEqual(200);
      expect(body.deletedCount).toEqual(1);

      const listTeamsRes = await api.get('/v1/tfm/teams');
      expect(listTeamsRes.body.teams).toEqual(expectMongoIds([mockTeams[1]]));
    });
  });
});
