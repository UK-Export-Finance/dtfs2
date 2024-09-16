const { when } = require('jest-when');
const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const { initialiseTestUsers } = require('../../api-test-users');
const api = require('../../../src/v1/api');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { TEAMS } = require('../../../src/constants');

const { as, get } = createApi(app);

describe('GET /teams/:teamId/members', () => {
  const validTeamId = TEAMS.BUSINESS_SUPPORT.id;
  const validUrlToGetTeamMembers = `/v1/teams/${validTeamId}/members`;
  let tokenUser;

  beforeAll(async () => {
    tokenUser = await initialiseTestUsers(app);
  });

  afterAll(() => {
    api.findTeamMembers.mockReset();
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(validUrlToGetTeamMembers),
    makeRequestWithAuthHeader: (authHeader) => get(validUrlToGetTeamMembers, { headers: { Authorization: authHeader } }),
  });

  it('returns a 400 response if the teamId is not one of the allowed values', async () => {
    const unexpectedTeamId = 'unexpected team id';

    const { status, body } = await as(tokenUser).get(`/v1/teams/${unexpectedTeamId}/members`);

    const allTeamsSeparatedByComma = Object.values(TEAMS)
      .map((team) => team.id)
      .join(', ');
    expect(status).toBe(400);
    expect(body).toStrictEqual({
      status: 400,
      errors: [
        {
          location: 'params',
          msg: `teamId must be one of ${allTeamsSeparatedByComma}`,
          path: 'teamId',
          type: 'field',
          value: 'unexpected team id',
        },
      ],
    });
  });

  it('returns the status and data from the api call if DTFS Central does not respond', async () => {
    const statusFromDtfsCentralApiCall = 400;
    const dataFromDtfsCentralApiCall = 'Error message';
    when(api.findTeamMembers).calledWith(validTeamId).mockResolvedValueOnce({
      status: statusFromDtfsCentralApiCall,
      data: dataFromDtfsCentralApiCall,
    });

    const { status, body } = await as(tokenUser).get(validUrlToGetTeamMembers);

    expect(status).toBe(statusFromDtfsCentralApiCall);
    expect(body).toStrictEqual({
      status: statusFromDtfsCentralApiCall,
      data: dataFromDtfsCentralApiCall,
    });
  });

  describe.each([
    TEAMS.BUSINESS_SUPPORT.id,
    TEAMS.PIM.id,
    TEAMS.RISK_MANAGERS.id,
    TEAMS.UNDERWRITERS.id,
    TEAMS.UNDERWRITER_MANAGERS.id,
    TEAMS.UNDERWRITING_SUPPORT.id,
  ])('for teamId %s', (teamId) => {
    it('returns a 200 response with only the _id, first name, and last name of the team members returned by DTFS Central', async () => {
      const expectedTeamMemberDataToReturn = [
        {
          _id: 'mongo-id-1',
          firstName: 'First1',
          lastName: 'Last1',
        },
        {
          _id: 'mongo-id-2',
          firstName: 'First2',
          lastName: 'Last2',
        },
        {
          _id: 'mongo-id-3',
          firstName: 'First3',
          lastName: 'Last3',
        },
      ];
      const usersReturnedByDtfsCentral = expectedTeamMemberDataToReturn.map(({ _id, firstName, lastName }, index) => ({
        _id,
        username: `${firstName}.${lastName}.${index}@example.com`,
        email: `${firstName}.${lastName}.${index}@example.com`,
        teams: [teamId],
        timezone: 'Europe/London',
        firstName,
        lastName,
      }));
      when(api.findTeamMembers).calledWith(teamId).mockResolvedValueOnce(usersReturnedByDtfsCentral);

      const { status, body } = await as(tokenUser).get(`/v1/teams/${teamId}/members`);

      expect(status).toBe(200);
      expect(body).toStrictEqual({ teamMembers: expectedTeamMemberDataToReturn });
    });

    it('returns a 200 response with an empty array if DTFS Central responds with an empty array of users', async () => {
      when(api.findTeamMembers).calledWith(teamId).mockResolvedValueOnce([]);

      const { status, body } = await as(tokenUser).get(`/v1/teams/${teamId}/members`);

      expect(status).toBe(200);
      expect(body).toStrictEqual({ teamMembers: [] });
    });
  });
});
