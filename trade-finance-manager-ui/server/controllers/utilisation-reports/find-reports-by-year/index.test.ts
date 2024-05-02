import httpMocks from 'node-mocks-http';
import api from '../../../api';
import { getReportsByYear } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aBank } from '../../../../test-helpers/test-data/bank';
import { aMonthlyBankReportPeriodSchedule } from '../../../../test-helpers/test-data/bank-report-period-schedule';
import { Bank } from '../../../types/banks';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/find-reports-by-year', () => {
  const BANK_ID_ONE = '1';
  const BANK_ID_TWO = '2';
  const BANK_ID_THREE = '3';
  const BANK_NAME_ONE = 'Barclays Bank';
  const BANK_NAME_TWO = 'HSBC';
  const BANK_NAME_THREE = 'Newable';
  const banks: Bank[] = [
    {
      ...aBank(),
      id: BANK_ID_ONE,
      name: BANK_NAME_ONE,
      utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
    },
    {
      ...aBank(),
      id: BANK_ID_TWO,
      name: BANK_NAME_TWO,
      utilisationReportPeriodSchedule: [
        { startMonth: 1, endMonth: 3 },
        { startMonth: 4, endMonth: 6 },
        { startMonth: 7, endMonth: 9 },
        { startMonth: 10, endMonth: 12 },
      ],
    },
    {
      ...aBank(),
      id: BANK_ID_THREE,
      name: BANK_NAME_THREE,
      utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findUtilisationReportsForm', () => {
    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: { userToken: 'user-token', user: MOCK_TFM_SESSION_USER },
      });

      jest.mocked(api.getBanksVisibleInTfmUtilisationReports).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with required data when there are no query params or errors", async () => {
      // Arrange
      const userToken = 'user-token';

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
      });

      jest.mocked(api.getBanksVisibleInTfmUtilisationReports).mockResolvedValue(banks);
      const expectedBankItems = [
        {
          value: BANK_ID_ONE,
          text: BANK_NAME_ONE,
          attributes: { 'data-cy': `${BANK_NAME_ONE}-radio` },
        },
        {
          value: BANK_ID_TWO,
          text: BANK_NAME_TWO,
          attributes: { 'data-cy': `${BANK_NAME_TWO}-radio` },
        },
        {
          value: BANK_ID_THREE,
          text: BANK_NAME_THREE,
          attributes: { 'data-cy': `${BANK_NAME_THREE}-radio` },
        },
      ];

      // Act
      await getReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems: expectedBankItems,
        errorSummary: [],
        bankError: undefined,
        yearError: undefined,
      });
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with required data when there are query params with errors", async () => {
      // Arrange
      const userToken = 'user-token';
      const yearQuery = '20';

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
        query: { year: yearQuery },
      });

      jest.mocked(api.getBanksVisibleInTfmUtilisationReports).mockResolvedValue(banks);
      const expectedBankItems = [
        {
          value: BANK_ID_ONE,
          text: BANK_NAME_ONE,
          attributes: { 'data-cy': `${BANK_NAME_ONE}-radio` },
        },
        {
          value: BANK_ID_TWO,
          text: BANK_NAME_TWO,
          attributes: { 'data-cy': `${BANK_NAME_TWO}-radio` },
        },
        {
          value: BANK_ID_THREE,
          text: BANK_NAME_THREE,
          attributes: { 'data-cy': `${BANK_NAME_THREE}-radio` },
        },
      ];
      const expectedBankError = 'Select a bank';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [
        { text: expectedBankError, href: '#bank' },
        { text: expectedYearError, href: '#year' },
      ];

      // Act
      await getReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems: expectedBankItems,
        errorSummary: expectedErrorSummary,
        bankError: expectedBankError,
        yearError: expectedYearError,
      });
    });

    it("renders the 'bank-previous-years-reports.njk' view with required data when there are valid query params", async () => {
      // Arrange
      const userToken = 'user-token';
      const bankQuery = BANK_ID_ONE;
      const yearQuery = new Date().getFullYear().toString();

      const { res, req } = httpMocks.createMocks({
        session: { userToken, user: MOCK_TFM_SESSION_USER },
        query: { bank: bankQuery, year: yearQuery },
      });

      jest.mocked(api.getBanksVisibleInTfmUtilisationReports).mockResolvedValue(banks);

      // Act
      await getReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/bank-previous-years-reports.njk');
    });
  });
});
