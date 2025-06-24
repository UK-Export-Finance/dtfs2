import { HttpStatusCode } from 'axios';
import { ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import { tfmDeal, tfmTeam, tfmFacility } from './tfm.controller';
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

const invalidIds = ['', null, undefined];

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
      expect(console.error).toHaveBeenCalledTimes(1);
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
      const mockError = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce({});

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, mockError);
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
      const mockError = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce(undefined);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, mockError);
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
      const mockError = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce(null);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, mockError);
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
      const mockError = new Error('Invalid response received');

      api.getTfmTeam.mockResolvedValueOnce({
        data: {},
      });

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, mockError);
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
    it(`should thrown an ${HttpStatusCode.InternalServerError} when an exception has occurred`, async () => {
      // Arrange
      const mockRequest = {
        params: {
          teamId: ALL_TEAM_IDS[0],
        },
      };
      const mockError = new Error('API error');

      api.getTfmTeam.mockRejectedValue(mockError);

      // Act
      await tfmTeam(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', mockRequest.params?.teamId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM team');
    });
  });
});

describe('tfmDeal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const dealId = '61a7710b2ae62b0013dae687';

  describe('Invalid TFM deal ID', () => {
    it.each(invalidIds)(`should return ${HttpStatusCode.BadRequest} when an invalid deal ID '%s' is supplied`, async (invalidDealId) => {
      // Arrange
      const mockRequest = {
        params: {
          dealId: invalidDealId,
        },
      };

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Invalid TFM deal ID %s provided', invalidDealId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(mockResponse.send).toHaveBeenCalledWith('Invalid TFM deal ID provided');
    });
  });

  describe('Invalid response received', () => {
    it('should throw an error if an empty response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Invalid TFM deal response received');

      api.getTfmDeal.mockResolvedValueOnce('');

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });

    it('should throw an error if an undefined response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Invalid TFM deal response received');

      api.getTfmDeal.mockResolvedValueOnce(undefined);

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });

    it('should throw an error if a null response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Invalid TFM deal response received');

      api.getTfmDeal.mockResolvedValueOnce(null);

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });

    it('should throw an error if an empty data response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Invalid TFM deal response received');

      api.getTfmDeal.mockResolvedValueOnce({});

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });

    it('should throw an error if an empty data response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Invalid TFM deal response received');

      api.getTfmDeal.mockResolvedValueOnce({
        data: {},
      });

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });
  });

  describe('Valid respone received', () => {
    it('should return the deal data with a successful response', async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      // TFM deal object
      const deal = {
        _id: dealId,
        dealSnapshot: {
          dealId,
        },
        tfm: {},
      };

      api.getTfmDeal.mockResolvedValueOnce({
        data: {
          deal,
        },
      });

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(mockResponse.send).toHaveBeenCalledWith(deal);
    });
  });

  describe('An exception has occurred', () => {
    it(`should throw an ${HttpStatusCode.InternalServerError} when an exception has occurred`, async () => {
      // Arrange
      const mockRequest = {
        params: {
          dealId,
        },
      };

      const mockError = new Error('Test error');

      api.getTfmDeal.mockRejectedValue(mockError);

      // Act
      await tfmDeal(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM deal');
    });
  });
});

describe('tfmFacility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const facilityId = '61a7710b2ae62b0013dae687';

  describe('Invalid TFM facility ID', () => {
    it.each(invalidIds)(`should return ${HttpStatusCode.BadRequest} when an invalid deal ID '%s' is supplied`, async (invalidFacilityId) => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId: invalidFacilityId,
        },
      };

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Invalid TFM facility ID %s provided', invalidFacilityId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
      expect(mockResponse.send).toHaveBeenCalledWith('Invalid TFM facility ID provided');
    });
  });

  describe('Invalid response received', () => {
    it('should throw an error if an empty response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      const mockError = new Error('Invalid TFM facility response received');

      api.getTfmFacility.mockResolvedValueOnce('');

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM facility with ID %s %o', facilityId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM facility');
    });

    it('should throw an error if an undefined response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      const mockError = new Error('Invalid TFM facility response received');

      api.getTfmFacility.mockResolvedValueOnce(undefined);

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM facility with ID %s %o', facilityId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM facility');
    });

    it('should throw an error if a null response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      const mockError = new Error('Invalid TFM facility response received');

      api.getTfmFacility.mockResolvedValueOnce(null);

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM facility with ID %s %o', facilityId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM facility');
    });

    it('should throw an error if an empty data response is received', async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      const mockError = new Error('Invalid TFM facility response received');

      api.getTfmFacility.mockResolvedValueOnce({});

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM facility with ID %s %o', facilityId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM facility');
    });
  });

  describe('Valid respone received', () => {
    it('should return the deal data with a successful response', async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      // TFM facility object
      const facility = {
        _id: facilityId,
        facilitySnapshot: {
          facilityId,
        },
        tfm: {},
      };

      api.getTfmFacility.mockResolvedValueOnce({
        data: {
          ...facility,
        },
      });

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(mockResponse.send).toHaveBeenCalledWith(facility);
    });
  });

  describe('An exception has occurred', () => {
    it(`should throw an ${HttpStatusCode.InternalServerError} when an exception has occurred`, async () => {
      // Arrange
      const mockRequest = {
        params: {
          facilityId,
        },
      };

      const mockError = new Error('Test error');

      api.getTfmFacility.mockRejectedValue(mockError);

      // Act
      await tfmFacility(mockRequest, mockResponse);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM facility with ID %s %o', facilityId, mockError);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockResponse.send).toHaveBeenCalledWith('Unable to get the TFM facility');
    });
  });
});
