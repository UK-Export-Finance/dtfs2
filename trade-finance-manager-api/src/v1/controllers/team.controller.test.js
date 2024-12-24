import { HttpStatusCode } from 'axios';
import httpMock from 'node-mocks-http';
import { USER_STATUS } from '@ukef/dtfs2-common';
import { mapTeamMembers } from './team.controller';
import api from '../api';
import MOCK_USERS from '../__mocks__/mock-users';

jest.mock('../api');
console.error = jest.fn();

const res = httpMock.createResponse();
const req = {
  params: {
    teamId: 'UNDERWRITER_MANAGERS',
  },
};
const activeTeamMembers = MOCK_USERS.filter(({ status }) => status === USER_STATUS.ACTIVE).map(({ _id, firstName, lastName }) => ({
  _id,
  firstName,
  lastName,
}));

describe('mapTeamMembers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return active team members only', async () => {
    // Arrange
    api.findTeamMembers.mockResolvedValue(MOCK_USERS);
    const expectedMembers = {
      teamMembers: activeTeamMembers,
    };

    // Act
    await mapTeamMembers(req, res);

    // Assert
    expect(api.findTeamMembers).toHaveBeenCalledWith(req.params.teamId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(expectedMembers);

    expect(res._getData()).not.toHaveProperty('status');
    expect(res._getData()).not.toHaveProperty('data');
  });

  it(`should return ${HttpStatusCode.BadRequest} for an invalid team identifier`, async () => {
    // Arrange
    api.findTeamMembers.mockResolvedValue({ status: HttpStatusCode.BadRequest, data: 'Invalid team id provided' });
    const mockInvalidReq = {
      params: {
        teamId: 'INVALID',
      },
    };

    // Act
    await mapTeamMembers(mockInvalidReq, res);

    // Assert
    expect(api.findTeamMembers).toHaveBeenCalledWith(mockInvalidReq.params.teamId);
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);

    expect(res._getData().status).toBe(HttpStatusCode.BadRequest);
    expect(res._getData().data).toEqual('Invalid team id provided');
  });

  it(`should return ${HttpStatusCode.InternalServerError} for a caught exception`, async () => {
    // Arrange
    api.findTeamMembers.mockRejectedValue(new Error('Mock error'));

    // Act
    await mapTeamMembers(req, res);

    // Assert
    expect(api.findTeamMembers).toHaveBeenCalledWith(req.params.teamId);

    expect(console.error).toHaveBeenCalledWith('An error occurred while mapping TFM team members %o', new Error('Mock error'));
    expect(res.statusCode).toBe(HttpStatusCode.InternalServerError);
  });
});
