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
      expect(axios).toHaveBeenCalledWith({ method: 'get', url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${teamId}`, headers });
    });

    it('should return all the TFM teams object when no argument is providedt', async () => {
      // Arrange
      const expected = {
        teams: [
          {
            _id: '6808ed99f8e01d29283c1d44',
            id: 'UNDERWRITER_MANAGERS',
            name: 'Underwriter managers',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d45',
            id: 'UNDERWRITING_SUPPORT',
            name: 'Underwriting support',
            email: 'maker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d46',
            id: 'BUSINESS_SUPPORT',
            name: 'Business support group',
            email: 'maker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d47',
            id: 'PDC_RECONCILE',
            name: 'PDC reconcile',
            email: 'payment-officer3@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d48',
            id: 'UNDERWRITERS',
            name: 'Underwriters',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d49',
            id: 'RISK_MANAGERS',
            name: 'Risk managers',
            email: 'checker1@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d4a',
            id: 'PIM',
            name: 'PIM',
            email: 'checker2@ukexportfinance.gov.uk',
            auditRecord: {},
          },
          {
            _id: '6808ed99f8e01d29283c1d4b',
            id: 'PDC_READ',
            name: 'PDC read',
            email: 'payment-officer2@ukexportfinance.gov.uk',
            auditRecord: {},
          },
        ],
      };

      axios.mockResolvedValueOnce(expected);

      // Act
      const response = await getTfmTeam();

      // Assert
      expect(response).toMatchObject(expected);
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
