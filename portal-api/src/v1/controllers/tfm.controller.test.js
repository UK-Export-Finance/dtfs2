import { HttpStatusCode } from 'axios';
import { ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import { tfmTeam } from './tfm.controller';
import { mockReq, mockRes } from '../../../api-tests/v1/mocks';

const mockResponse = mockRes();
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

console.error = jest.fn();

describe('tfmTeam', () => {
  it.each(invalidTeamIds)('should throw an error when an invalid %s TFM id is provided', async (teamId) => {
    // Arrange
    const expectedResponse = {
      status: HttpStatusCode.BadRequest,
      data: `Invalid TFM team ID provide ${teamId}`,
    };
    const mockRequest = {
      ...mockReq,
      params: {
        teamId,
      },
    };

    // Act
    const response = await tfmTeam(mockRequest, mockResponse);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Invalid TFM team ID %s provided', teamId);
    expect(response).toStrictEqual(expectedResponse);
  });
});
