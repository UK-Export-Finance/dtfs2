import axios, { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { HEADERS, ROLES, ALL_TEAM_IDS } from '@ukef/dtfs2-common';
import { getTfmDeal, getTfmTeam, findGefFacilitiesByDealId } from './api';

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
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it.each(invalidTeamIds)('should return undefined when %s TFM id is supplied', async (teamId) => {
      // Arrange
      axios.mockResolvedValueOnce({
        data: '',
        status: HttpStatusCode.NotFound,
      });

      // Act
      const response = await getTfmTeam(teamId);

      // Assert
      expect(response.data).toEqual('');
      expect(response.status).toEqual(HttpStatusCode.NotFound);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`, headers });
    });
  });

  describe('Successful API calls', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it.each(validTeamIds)('should return the %s team object', async (teamId) => {
      // Arrange
      const team = {
        _id: '68079846dea139348cb2d7ff',
        id: teamId,
        name: teamId,
        email: 'checker2@ukexportfinance.gov.uk',
        auditRecord: {},
      };

      const expected = {
        data: {
          team,
        },
      };

      axios.mockResolvedValueOnce(expected);

      // Act
      const response = await getTfmTeam(teamId);

      // Assert
      expect(response).toMatchObject(expected);
      expect(axios).toHaveBeenCalledTimes(1);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`, headers });
    });

    it('should return all the TFM teams object when no argument is providedt', async () => {
      // Arrange
      const mockResponse = {
        teams: [
          {
            _id: '6808ed99f8e01d29283c1d44',
            id: ALL_TEAM_IDS[0],
            name: 'Underwriter managers',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d45',
            id: ALL_TEAM_IDS[1],
            name: 'Underwriting support',
            email: 'maker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d46',
            id: ALL_TEAM_IDS[2],
            name: 'Business support group',
            email: 'maker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d47',
            id: ALL_TEAM_IDS[3],
            name: 'PDC reconcile',
            email: 'payment-officer3@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d48',
            id: ALL_TEAM_IDS[4],
            name: 'Underwriters',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d49',
            id: ALL_TEAM_IDS[5],
            name: 'Risk managers',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d4a',
            id: ALL_TEAM_IDS[6],
            name: 'PIM',
            email: 'checker2@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d4b',
            id: ALL_TEAM_IDS[7],
            name: 'PDC read',
            email: 'payment-officer2@ukexportfinance.gov.uk',
            auditRecord: {},
          },
        ],
      };

      axios.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmTeam();

      // Assert
      expect(response).toMatchObject(mockResponse);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/undefined`, headers });
    });
  });

  describe('Exception handling', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should catch an error if an exception has occurred during an API call', async () => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.InternalServerError,
        data: 'Unable to get the TFM team',
      };
      const underwriter = ALL_TEAM_IDS[0];
      const error = new Error('Test error');

      axios.mockRejectedValueOnce(error);

      // Act
      const response = await getTfmTeam(underwriter);

      // Assert
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${underwriter}`, headers });
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', underwriter, error);
      expect(console.error).toHaveBeenCalledTimes(1);
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
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${pim}`, headers });
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM team with ID %s %o', pim, error);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(expectedResponse);
    });
  });
});

describe('getTfmDeal', () => {
  const invalidDealIds = ['', undefined, null, {}, []];

  describe('Argument validation', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it.each(invalidDealIds)(`should return ${HttpStatusCode.BadRequest} when an invalid '%s' as a deal ID is supplied`, async (dealId) => {
      // Arrange
      axios.mockResolvedValueOnce({
        message: 'Deal not found',
        status: HttpStatusCode.NotFound,
      });

      // Act
      const response = await getTfmDeal(dealId);

      // Assert
      expect(response.message).toEqual('Deal not found');
      expect(response.status).toEqual(HttpStatusCode.NotFound);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`, headers });
    });
  });

  describe('Successful API calls', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should return the TFM deal object', async () => {
      // Arrange
      const dealId = '68373b75712a02a036441ae8';
      const mockResponse = {
        _id: dealId,
        dealSnaphot: {},
        tfm: {},
      };

      axios.mockResolvedValueOnce({
        status: HttpStatusCode.Ok,
        data: mockResponse,
      });

      // Act
      const response = await getTfmDeal('68373b75712a02a036441ae8');

      // Assert
      expect(response.data).toMatchObject(mockResponse);
      expect(response.status).toBe(HttpStatusCode.Ok);
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`, headers });
    });
  });

  describe('Exception handling', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    const dealId = '68373b75712a02a036441ae8';

    it('should catch an error if an exception has occurred during an API call', async () => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.InternalServerError,
        data: 'Unable to get the TFM deal',
      };
      const error = new Error('Test error');

      axios.mockRejectedValueOnce(error);

      // Act
      const response = await getTfmDeal(dealId);

      // Assert
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`, headers });
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, error);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(expectedResponse);
    });

    it('should catch an error if an exception has occurred with custom error code', async () => {
      // Arrange
      const expectedResponse = {
        status: HttpStatusCode.BadGateway,
        data: 'Unable to get the TFM deal',
      };

      const error = {
        code: HttpStatusCode.BadGateway,
        data: 'Bad gateway error',
      };

      axios.mockRejectedValueOnce(error);

      // Act
      const response = await getTfmDeal(dealId);

      // Assert
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${dealId}`, headers });
      expect(console.error).toHaveBeenCalledWith('Unable to get the TFM deal with ID %s %o', dealId, error);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(expectedResponse);
    });
  });
});

describe('findGefFacilitiesByDealId ', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const dealId = new ObjectId();

  const mockResponse = [
    {
      _id: new ObjectId(),
      hasBeenIssued: false,
      dealId,
    },
    {
      _id: new ObjectId(),
      hasBeenIssued: true,
      dealId,
    },
  ];

  describe('when facilities are found', () => {
    it('should return the facilities', async () => {
      axios.mockResolvedValueOnce({ data: mockResponse });

      const response = await findGefFacilitiesByDealId(dealId);

      expect(response).toEqual(mockResponse);
    });
  });

  describe('when an error occurs', () => {
    it(`should return ${HttpStatusCode.InternalServerError} and a message`, async () => {
      const error = new Error('Test error');
      axios.mockRejectedValueOnce(error);

      const response = await findGefFacilitiesByDealId(dealId);

      const expectedResponse = {
        status: HttpStatusCode.InternalServerError,
        data: 'Error when finding facilities by dealId',
      };

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('when an error occurs with custom error code', () => {
    it(`should return ${HttpStatusCode.BadGateway} and a message`, async () => {
      const error = {
        code: HttpStatusCode.BadGateway,
        data: 'Bad gateway error',
      };
      axios.mockRejectedValueOnce(error);

      const response = await findGefFacilitiesByDealId(dealId);

      const expectedResponse = {
        status: HttpStatusCode.BadGateway,
        data: 'Error when finding facilities by dealId',
      };

      expect(response).toEqual(expectedResponse);
    });
  });
});
