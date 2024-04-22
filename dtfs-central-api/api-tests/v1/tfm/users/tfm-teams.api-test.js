const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { expectMongoIds } = require('../../../expectMongoIds');
const { DB_COLLECTIONS } = require('../../../../src/constants');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');

const mockTeams = [
  {
    id: 'TEAM1',
    name: 'Mock Team 1',
    email: 'mock@test.com',
  },
  {
    id: 'TEAM2',
    name: 'Mock Team 2',
    email: 'mock@test.com',
  },
];

const orderTeams = (teams) => teams.sort((t1, t2) => t1.id.localeCompare(t2.id));

describe('/v1/tfm/teams', () => {
  beforeEach(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.TFM_TEAMS]);
  });

  describe('POST /v1/tfm/teams', () => {
    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => api.post({ team: mockTeams[0], auditDetails }).to('/v1/tfm/teams'),
      validUserTypes: ['tfm'],
    });

    it('returns the created resource', async () => {
      const mockTeam = mockTeams[0];

      const { status, body } = await api.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams');

      expect(status).toEqual(200);

      const teamMongoId = body._id;

      const { body: teamAfterCreation } = await api.get(`/v1/tfm/teams/${mockTeam.id}`);

      expect(teamAfterCreation).toMatchObject({
        team: {
          _id: teamMongoId,
          ...mockTeam,
          auditRecord: {
            lastUpdatedAt: expect.any(String),
            lastUpdatedByPortalUserId: null,
            lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
            lastUpdatedByIsSystem: null,
            noUserLoggedIn: null,
          },
        },
      });
    });
  });

  describe('GET /v1/tfm/teams', () => {
    it('returns all teams', async () => {
      await Promise.all(
        mockTeams.map(async (mockTeam) => api.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams')),
      );
      const { status, body } = await api.get('/v1/tfm/teams');
      expect(status).toEqual(200);
      expect(orderTeams(body.teams)).toEqual(
        orderTeams(
          expectMongoIds(
            mockTeams.map((team) => ({
              ...team,
              auditRecord: {
                lastUpdatedAt: expect.any(String),
                lastUpdatedByPortalUserId: null,
                lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
                lastUpdatedByIsSystem: null,
                noUserLoggedIn: null,
              },
            })),
          ),
        ),
      );
    });
  });

  describe('GET /v1/tfm/teams/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/teams/12345678910');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const mockTeam = mockTeams[0];

      await api.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams');

      const teamId = mockTeam.id;

      const { status, body } = await api.get(`/v1/tfm/teams/${teamId}`);

      expect(status).toEqual(200);
      expect(body.team).toMatchObject({
        ...mockTeam,
        auditRecord: {
          lastUpdatedAt: expect.any(String),
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        },
      });
    });
  });

  describe('DELETE /v1/tfm/teams/:id', () => {
    it('deletes the team', async () => {
      await Promise.all(
        mockTeams.map(async (mockTeam) => api.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams')),
      );

      const { status, body } = await api.remove().to(`/v1/tfm/teams/${mockTeams[0].id}`);

      expect(status).toEqual(200);
      expect(body.deletedCount).toEqual(1);

      const listTeamsRes = await api.get('/v1/tfm/teams');
      expect(listTeamsRes.body.teams).toEqual(
        expectMongoIds([
          {
            ...mockTeams[1],
            auditRecord: {
              lastUpdatedAt: expect.any(String),
              lastUpdatedByPortalUserId: null,
              lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
              lastUpdatedByIsSystem: null,
              noUserLoggedIn: null,
            },
          },
        ]),
      );
    });
  });
});
