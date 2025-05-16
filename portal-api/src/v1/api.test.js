import axios, { HttpStatusCode } from 'axios';
import { HEADERS, ROLES, ALL_TEAM_IDS, ALL_AMENDMENT_SUBMITTED_STATUSES, PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getTfmTeam, getFacilityAmendmentsOnDeal } from './api';

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
    });
  });

  describe('Successfull API calls', () => {
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

describe('getFacilityAmendmentsOnDeal', () => {
  const dealId = '507f1f77bcf86cd799439011';
  const facilityId = '6597dffeb5ef5ff4267e5044';
  const params = { statuses: ALL_AMENDMENT_SUBMITTED_STATUSES };
  const mockResponseData = [
    { dealId, facilityId, amendmentId: 'amendment1', status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED },
    { dealId, facilityId, amendmentId: 'amendment2', status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED },
    { dealId, facilityId, amendmentId: 'amendment3', status: TFM_AMENDMENT_STATUS.COMPLETED },
  ];

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should return all submitted amendments when the API call is successful', async () => {
    // Arrange
    const expected = {
      data: {
        mockResponseData,
      },
    };

    axios.mockResolvedValueOnce(expected);

    // Act
    const response = await getFacilityAmendmentsOnDeal(dealId, ALL_AMENDMENT_SUBMITTED_STATUSES);

    // Assert
    expect(response).toMatchObject(expected.data);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/all-type-amendments`, params, headers });
  });

  it('should throw an error when the API call fails', async () => {
    // Arrange
    const error = new Error('API call failed');
    axios.mockRejectedValueOnce(error);

    // Act
    const response = getFacilityAmendmentsOnDeal(dealId, ALL_AMENDMENT_SUBMITTED_STATUSES);

    // Assert
    await expect(response).rejects.toThrow('API call failed');
  });

  it('should return all amendments when statuses are an empty array', async () => {
    // Arrange
    const emptyStatuses = [];
    params.statuses = emptyStatuses;
    const expected = {
      data: {
        mockResponseData,
      },
    };

    axios.mockResolvedValueOnce(expected);

    // Act
    const response = await getFacilityAmendmentsOnDeal(dealId, emptyStatuses);

    // Assert
    expect(response).toMatchObject(expected.data);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/all-type-amendments`, params, headers });
  });
});
