import { HttpStatusCode } from 'axios';
import { ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import { tfmTeam } from './tfm.controller';
import { mockRes } from '../../../api-tests/v1/mocks';
import * as api from '../api';

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

jest.mock('../api');
console.error = jest.fn();

describe('tfmTeam', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Invalid TFM team ID', () => {
    it.each(invalidTeamIds)(`Should return ${HttpStatusCode.BadRequest} when an invalid TFM team ID is provided`, async (teamId) => {
      // Arrange
      const mockRequest = {
        params: {
          teamId,
        },
      };

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Invalid TFM team ID %s provided', teamId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(mockResponse.send).toHaveBeenCalledWith(`Invalid TFM team ID provided ${teamId}`);
    });
  });

  describe('Invalid response received', () => {
    it('should throw an error when an empty object response is received from the API call', async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const error = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce({});

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, error);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM team');
    });

    it('should throw an error when an undefined response is received from the API call', async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const error = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce(undefined);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, error);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM team');
    });

    it('should throw an error when a null response is received from the API call', async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const error = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce(null);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, error);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM team');
    });

    it('should throw an error when an empty data response object is received from the API call', async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const error = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce({
        data: {},
      });

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, error);
    });
  });

  describe('Valid response received', () => {
    it('should return the team data with a successful response', async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const team = {
        id: ALL_TEAM_IDS[0],
        name: ALL_TEAM_IDS[0],
        email: 'checker2@ukexportfinance.gov.uk',
      };

      api.getTfmTeam.mockResolvedValueOnce({
        data: {
          team,
        },
      });

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(mockResponse.send).toHaveBeenCalledWith(team);
    });
  });

  describe('An exception has occurred', () => {
    it(`should thrown an ${HttpStatusCode.InternalServerError} if an exception has occurred`, async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const error = new Error('API error');

      api.getTfmTeam.mockRejectedValue(error);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, error);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM team');
    });
  });
});
