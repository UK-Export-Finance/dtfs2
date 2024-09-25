import { HttpStatusCode } from 'axios';
import { AnyObject, TEAM_IDS, TeamId } from '@ukef/dtfs2-common';
import { TestUser } from '../types/test-user';

type ResponseObject = { status: number; body: AnyObject };

type WithTeamAuthorisationTestsParams = {
  allowedTeams: TeamId[];
  getUserWithTeam: (team: TeamId) => TestUser;
  makeRequestAsUser: (user: TestUser) => Promise<ResponseObject>;
  successStatusCode: number;
};

const expectForbiddenResponse = ({ status, body }: ResponseObject) => {
  expect(status).toBe(HttpStatusCode.Forbidden);
  expect(body).toStrictEqual({
    success: false,
    msg: "You don't have access to this page",
  });
};

const allTeams = Object.values(TEAM_IDS);

/**
 * Tests for the user team authorisation
 * @param params
 * @param params.allowedTeams - teams allowed on the endpoint
 * @param params.getUserWithTeam - Generate a logged in user
 * @param params.makeRequestAsUser - Make request to the endpoint
 * @param params.successStatusCode - status code on success
 */
export const withTeamAuthorisationTests = ({ allowedTeams, getUserWithTeam, makeRequestAsUser, successStatusCode }: WithTeamAuthorisationTestsParams) => {
  const notAllowedTeams = allTeams.filter((team) => !allowedTeams.includes(team));

  if (notAllowedTeams.length) {
    it.each(notAllowedTeams)('returns a 403 response for requests from a user with team %s', async (team) => {
      const userWithTeam = getUserWithTeam(team);
      const response = await makeRequestAsUser(userWithTeam);
      expectForbiddenResponse(response);
    });
  }

  it.each(allowedTeams)(`returns a ${successStatusCode} response for requests from a user with team %s`, async (team) => {
    const userWithTeam = getUserWithTeam(team);
    const { status } = await makeRequestAsUser(userWithTeam);
    expect(status).toBe(successStatusCode);
  });
};
