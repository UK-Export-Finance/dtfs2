import { HttpStatusCode } from 'axios';
import { getTfmTeam } from './api';

console.error = jest.fn();

describe('getTfmTeam', () => {
  it('should throw an error when an invalid TFM id is provided', () => {
    // Arrange
    const teamId = 'invalid';
    const expectedResponse = {
      status: HttpStatusCode.BadRequest,
      data: 'Invalid TFM team ID provided',
    };

    // Act
    const response = getTfmTeam(teamId);

    // Assert
    expect(console.error).toHaveBeenCalledWith('Invalid TFM team ID %s provided', teamId);
    expect(response).toBe(expectedResponse);
  });
});
