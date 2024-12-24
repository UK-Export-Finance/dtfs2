const { when } = require('jest-when');
const { USER_STATUS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const { initialiseTestUsers } = require('../../api-test-users');
const api = require('../../../src/v1/api');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { TEAMS } = require('../../../src/constants');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

const { as, get } = createApi(app);

describe('GET /teams/:teamId/members', () => {
  const validTeamId = TEAMS.BUSINESS_SUPPORT.id;
  const validUrlToGetTeamMembers = `/v1/teams/${validTeamId}/members`;
  let tokenUser;

  beforeAll(async () => {
    const testUsers = await initialiseTestUsers(app);
    tokenUser = testUsers().one();
    console.error = jest.fn();
  });

  afterAll(() => {
    api.findTeamMembers.mockReset();
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => get(validUrlToGetTeamMembers),
    makeRequestWithAuthHeader: (authHeader) => get(validUrlToGetTeamMembers, { headers: { Authorization: authHeader } }),
  });

  const tfmTeams = [
    TEAMS.BUSINESS_SUPPORT.id,
    TEAMS.PIM.id,
    TEAMS.RISK_MANAGERS.id,
    TEAMS.UNDERWRITERS.id,
    TEAMS.UNDERWRITER_MANAGERS.id,
    TEAMS.UNDERWRITING_SUPPORT.id,
  ];

  describe.each(tfmTeams)('for teamId %s', (teamId) => {
    it(`should returns a ${HttpStatusCode.Ok} response with only the _id, first name, and last name of active team members only returned by DTFS Central`, async () => {
      // Arrange
      const usersReturnedByDtfsCentral = MOCK_USERS.map(({ _id, firstName, lastName, status }, index) => ({
        _id,
        username: `${firstName}.${lastName}.${index}@example.com`,
        email: `${firstName}.${lastName}.${index}@example.com`,
        teams: [teamId],
        timezone: 'Europe/London',
        firstName,
        lastName,
        status,
      }));

      const teamMembers = MOCK_USERS.filter(({ status }) => status === USER_STATUS.ACTIVE).map(({ _id, firstName, lastName }) => ({
        _id,
        firstName,
        lastName,
      }));

      when(api.findTeamMembers).calledWith(teamId).mockResolvedValueOnce(usersReturnedByDtfsCentral);

      // Act
      const { status, body } = await as(tokenUser).get(`/v1/teams/${teamId}/members`);

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toStrictEqual({ teamMembers });
    });

    it(`returns a ${HttpStatusCode.Ok} response with an empty array if DTFS Central responds with an empty array of users`, async () => {
      when(api.findTeamMembers).calledWith(teamId).mockResolvedValueOnce([]);

      const { status, body } = await as(tokenUser).get(`/v1/teams/${teamId}/members`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toStrictEqual({ teamMembers: [] });
    });
  });

  it(`should returns a ${HttpStatusCode.BadRequest} response if the teamId is invalid`, async () => {
    // Arrange
    const invalidTeamId = 'INVALID';
    const allTeamsSeparatedByComma = Object.values(TEAMS)
      .map((team) => team.id)
      .join(', ');

    // Act
    const { status, body } = await as(tokenUser).get(`/v1/teams/${invalidTeamId}/members`);

    // Assert
    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(body).toStrictEqual({
      status: HttpStatusCode.BadRequest,
      errors: [
        {
          location: 'params',
          msg: `teamId must be one of ${allTeamsSeparatedByComma}`,
          path: 'teamId',
          type: 'field',
          value: invalidTeamId,
        },
      ],
    });
  });

  it(`should returns ${HttpStatusCode.BadRequest} from the api call if DTFS Central does not respond`, async () => {
    // Arrange
    when(api.findTeamMembers).calledWith(validTeamId).mockResolvedValueOnce({
      status: HttpStatusCode.BadRequest,
      data: 'Error message',
    });

    // Act
    const { status, body } = await as(tokenUser).get(validUrlToGetTeamMembers);

    // Assert
    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(body).toStrictEqual({
      status: HttpStatusCode.BadRequest,
      data: 'Error message',
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if an exception is thrown`, async () => {
    // Arrange
    when(api.findTeamMembers).calledWith(validTeamId).mockRejectedValue(new Error('Mock error'));

    // Act
    const { status } = await as(tokenUser).get(validUrlToGetTeamMembers);

    // Assert
    expect(console.error).toHaveBeenCalledWith('An error occurred while mapping TFM team members %o', new Error('Mock error'));
    expect(status).toEqual(HttpStatusCode.InternalServerError);
  });
});
