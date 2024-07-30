import { TEAMS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { testApi } from '../../../test-api';

beforeAll(async () => {
  const teamsCollection = await mongoDbClient.getCollection('tfm-teams');
  await teamsCollection.deleteMany({});
  await teamsCollection.insertMany(Object.values(TEAMS));
});

afterAll(async () => {
  const teamsCollection = await mongoDbClient.getCollection('tfm-teams');
  await teamsCollection.deleteMany({});
});

describe('GET /v1/tfm/teams', () => {
  const getUrl = () => '/v1/tfm/teams';
  it('returns a 200 (Ok)', async () => {
    // Act
    const { status } = await testApi.get(getUrl());

    // Assert
    expect(status).toBe(HttpStatusCode.Ok);
  });
});

describe('GET /v1/tfm/teams/:teamId', () => {
  const getUrl = (teamId: string) => `/v1/tfm/teams/${teamId}`;

  it('returns a 404 (Not found) when a team with the supplied id does not exist', async () => {
    // Arrange
    const teamId = 'invalid-team-id';

    // Act
    const { status } = await testApi.get(getUrl(teamId));

    // Assert
    expect(status).toBe(HttpStatusCode.NotFound);
  });

  it.each(Object.values(TEAMS))("returns a 200 (Ok) and the found team when the team id is '$id'", async (team) => {
    // Act
    const response = await testApi.get(getUrl(team.id));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body).toEqual({
      ...team,
      _id: expect.any(String) as string,
    });
  });
});
