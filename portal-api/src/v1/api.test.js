import { HttpStatusCode } from 'axios';
import { HEADERS, ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import * as api from './api';

const { DTFS_CENTRAL_API_KEY } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': DTFS_CENTRAL_API_KEY,
};

console.error = jest.fn();
jest.mock('./api');

describe('getTfmTeam', () => {
  const invalidTeamIds = [{}, [], '', 'invalid', ROLES.MAKER, ROLES.CHECKER, ROLES.ADMIN, ROLES.PAYMENT_REPORT_OFFICER, ROLES.READ_ONLY];

  it.each(invalidTeamIds)('should throw an error when an %s TFM id is provided', async ({ teamId }) => {
    // Arrange
    const expectedResponse = {
      status: HttpStatusCode.BadRequest,
      data: 'Invalid TFM team ID provided',
    };

    // Act
    const response = await api.getTfmTeam(teamId);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Invalid TFM team ID %s provided', teamId);
    expect(response).toEqual(expectedResponse);
  });

  it('should catch an error if an exception has occured during an API call', async () => {
    // Arrange
    const expectedResponse = {
      status: HttpStatusCode.InternalServerError,
      data: 'Failed to find team',
    };
    const underwritter = ALL_TEAM_IDS[0];

    api.getTfmTeam.mockRejectedValueOnce(new Error('Test error'));

    // Act
    const response = await api.getTfmTeam(underwritter);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', underwritter, new Error('Test error'));
    expect(response).toEqual(expectedResponse);
  });
});
