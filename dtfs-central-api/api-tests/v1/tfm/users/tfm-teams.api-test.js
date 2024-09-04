import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withDeleteOneTests, generateMockTfmUserAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { withValidateAuditDetailsTests } from '../../../helpers/with-validate-audit-details.api-tests';
import { expectMongoIds } from '../../../expectMongoIds';
import { MOCK_TFM_USER } from '../../../mocks/test-users/mock-tfm-user';

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
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_TEAMS]);
  });

  describe('POST /v1/tfm/teams', () => {
    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.post({ team: mockTeams[0], auditDetails }).to('/v1/tfm/teams'),
      validUserTypes: [AUDIT_USER_TYPES.TFM],
    });

    it('returns the created resource', async () => {
      const mockTeam = mockTeams[0];

      const { status, body } = await testApi.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams');

      expect(status).toEqual(200);

      const teamMongoId = body._id;

      const { body: teamAfterCreation } = await testApi.get(`/v1/tfm/teams/${mockTeam.id}`);

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
        mockTeams.map(async (mockTeam) => testApi.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams')),
      );
      const { status, body } = await testApi.get('/v1/tfm/teams');
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
      const { status } = await testApi.get('/v1/tfm/teams/12345678910');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const mockTeam = mockTeams[0];

      await testApi.post({ team: mockTeam, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams');

      const teamId = mockTeam.id;

      const { status, body } = await testApi.get(`/v1/tfm/teams/${teamId}`);

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
    let teamToDeleteObjectId;

    beforeEach(async () => {
      const { body } = await testApi.post({ team: mockTeams[0], auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/teams');

      teamToDeleteObjectId = body._id;
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.remove({ auditDetails }).to(`/v1/tfm/teams/${mockTeams[0].id}`),
    });

    withDeleteOneTests({
      makeRequest: () => testApi.remove({ auditDetails: generateTfmAuditDetails('abcdef123456abcdef123456') }).to(`/v1/tfm/teams/${mockTeams[0].id}`),
      collectionName: MONGO_DB_COLLECTIONS.TFM_TEAMS,
      auditRecord: generateMockTfmUserAuditDatabaseRecord('abcdef123456abcdef123456'),
      getDeletedDocumentId: () => new ObjectId(teamToDeleteObjectId),
    });
  });
});
