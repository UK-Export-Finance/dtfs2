import axios, { HttpStatusCode } from 'axios';
import { HEADERS, ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import { getTfmTeam } from './api';

const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': DTFS_CENTRAL_API_KEY,
};

console.error = jest.fn();
jest.mock('axios');

describe('getTfmTeam', () => {
  const invalidTeamIds = [
    null,
    undefined,
    {},
    [],
    '',
    'invalid',
    `${ALL_TEAM_IDS[0]}invalid`,
    ROLES.MAKER,
    ROLES.CHECKER,
    ROLES.ADMIN,
    ROLES.PAYMENT_REPORT_OFFICER,
    ROLES.READ_ONLY,
  ];

  const validTeamIds = ALL_TEAM_IDS;

  describe('Argument validation', () => {
    it.each(invalidTeamIds)('should throw an error when an %s TFM id is provided', async (teamId) => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.BadRequest,
        data: 'Invalid TFM team ID provided',
      };

      // Act
      const response = await getTfmTeam(teamId);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Invalid TFM team ID %s provided', teamId);
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('Successfull API calls', () => {
    it.each(validTeamIds)('should return the %s team object', async (teamId) => {
      // Arrange
      const team = {
        id: teamId,
        name: teamId,
        email: 'checker2@ukexportfinance.gov.uk',
      };

      axios.mockResolvedValueOnce({
        data: {
          team: {
            _id: '68079846dea139348cb2d7ff',
            ...team,
            auditRecord: {},
          },
        },
      });

      // Act
      const response = await getTfmTeam(teamId);

      // Assert
      expect(response).toMatchObject(team);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`, headers });
    });
  });

  describe('Exception handling', () => {
    it('should catch an error if an exception has occurred during an API call', async () => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.InternalServerError,
        data: 'Unable to get the TFM team',
      };
      const underwriter = ALL_TEAM_IDS[0];
      const error = 'Test error';

      axios.mockRejectedValueOnce(error);

      // Act
      const response = await getTfmTeam(underwriter);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', underwriter, error);
      expect(response).toStrictEqual(expectedResponse);
    });

    it('should catch an error if an exception has occurred with custom error code', async () => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.BadGateway,
        data: 'Unable to get the TFM team',
      };
      const pim = ALL_TEAM_IDS[5];
      const error = {
        code: HttpStatusCode.BadGateway,
        data: 'Bad gateway error',
      };

      axios.mockRejectedValueOnce(error);

      // Act
      const response = await getTfmTeam(pim);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', pim, error);
      expect(response).toStrictEqual(expectedResponse);
    });
  });
});
