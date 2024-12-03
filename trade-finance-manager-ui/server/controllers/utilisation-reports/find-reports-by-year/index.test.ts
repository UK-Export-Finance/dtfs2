import httpMocks from 'node-mocks-http';
import { PENDING_RECONCILIATION } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getFindReportsByYear } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { aBank } from '../../../../test-helpers/test-data/bank';
import { aMonthlyBankReportPeriodSchedule } from '../../../../test-helpers/test-data/bank-report-period-schedule';
import { BankWithReportingYearsResponseBody } from '../../../api-response-types';
import { FindUtilisationReportsByYearViewModel, UtilisationReportsByBankAndYearViewModel } from '../../../types/view-models';
import { UtilisationReportReconciliationSummaryItem } from '../../../types/utilisation-reports';

jest.mock('../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/find-reports-by-year', () => {
  const BANK_ID_ONE = '1';
  const BANK_ID_TWO = '2';
  const BANK_ID_THREE = '3';
  const BANK_NAME_ONE = 'Barclays Bank';
  const BANK_NAME_TWO = 'HSBC';
  const BANK_NAME_THREE = 'Newable';
  const BANKS: BankWithReportingYearsResponseBody[] = [
    {
      ...aBank(),
      id: BANK_ID_ONE,
      name: BANK_NAME_ONE,
      utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
      isVisibleInTfmUtilisationReports: true,
      reportingYears: [2020],
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
      isVisibleInTfmUtilisationReports: true,
      reportingYears: [2021, 2022, 2023],
    },
    {
      ...aBank(),
      id: BANK_ID_THREE,
      name: BANK_NAME_THREE,
      utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
      isVisibleInTfmUtilisationReports: true,
      reportingYears: [2024],
    },
  ];

  const EXPECTED_BANK_ITEMS = [
    {
      value: BANK_ID_ONE,
      text: BANK_NAME_ONE,
      attributes: { 'data-cy': `${BANK_ID_ONE}-radio` },
    },
    {
      value: BANK_ID_TWO,
      text: BANK_NAME_TWO,
      attributes: { 'data-cy': `${BANK_ID_TWO}-radio` },
    },
    {
      value: BANK_ID_THREE,
      text: BANK_NAME_THREE,
      attributes: { 'data-cy': `${BANK_ID_THREE}-radio` },
    },
  ];

  const EXPECTED_DATA_LISTS = [
    {
      bankId: BANK_ID_ONE,
      reportingYears: [2020],
    },
    {
      bankId: BANK_ID_TWO,
      reportingYears: [2021, 2022, 2023],
    },
    {
      bankId: BANK_ID_THREE,
      reportingYears: [2024],
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findUtilisationReportsForm', () => {
    const userToken = 'user-token';
    const requestSession = {
      userToken,
      user: MOCK_TFM_SESSION_USER,
    };
    const originalUrl = '/utilisation-reports/find-reports-by-year?';

    it("renders the 'problem-with-service' page when the bank query is provided but is not a string", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: ['123'] },
      });

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it("renders the 'problem-with-service' page when the year query is provided but is not a string", async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        query: { year: ['2023'] },
      });

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it("renders the 'problem-with-service' page on error", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockRejectedValue({
        response: { status: 404 },
      });

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with required data when there are no query params or errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems: EXPECTED_BANK_ITEMS,
        bankReportingYearsDataLists: EXPECTED_DATA_LISTS,
        errorSummary: [],
        bankError: undefined,
        yearError: undefined,
      });
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with when there is a query in the original URL with validation errors", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: '', year: '' },
        originalUrl,
      });

      const expectedBankError = 'Select a bank';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [
        { text: expectedBankError, href: '#bank' },
        { text: expectedYearError, href: '#year' },
      ];

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.errorSummary).toStrictEqual(expectedErrorSummary);
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.bankError).toEqual(expectedBankError);
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.yearError).toEqual(expectedYearError);
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with required data when there are query params with errors", async () => {
      // Arrange
      const yearQuery = '20';

      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { year: yearQuery },
        originalUrl,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      const expectedBankError = 'Select a bank';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [
        { text: expectedBankError, href: '#bank' },
        { text: expectedYearError, href: '#year' },
      ];

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect(res._getRenderData()).toMatchObject({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bankItems: EXPECTED_BANK_ITEMS,
        errorSummary: expectedErrorSummary,
        bankError: expectedBankError,
        yearError: expectedYearError,
        bankReportingYearsDataLists: EXPECTED_DATA_LISTS,
      });
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with banks not visible in tfm utilisation reports filtered out", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
      });
      const bankNotVisibleInTfmUtilisationReports: BankWithReportingYearsResponseBody = {
        ...aBank(),
        id: '999',
        isVisibleInTfmUtilisationReports: false,
        reportingYears: [],
      };

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue([...BANKS, bankNotVisibleInTfmUtilisationReports]);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      const { bankItems } = res._getRenderData() as FindUtilisationReportsByYearViewModel;
      expect(bankItems).toHaveLength(3);
      expect(bankItems).toEqual(EXPECTED_BANK_ITEMS);
      expect(bankItems.filter((bank) => bank.value === '999')).toHaveLength(0);
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with bank pre-selected if bank param was provided and there is an error with the year", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: BANK_ID_TWO, year: 'invalidYear' },
        originalUrl,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.selectedBank).toEqual(BANK_ID_TWO);
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with year pre-filled with year query param if there is an error with the bank", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: 'invalidBank', year: '2024' },
        originalUrl,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.selectedYear).toEqual('2024');
    });

    it("renders the 'find-utilisation-reports-by-year.njk' view with year pre-filled with year query param if there is an error with the year", async () => {
      // Arrange
      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: BANK_ID_TWO, year: 'Nonsense' },
        originalUrl,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/find-utilisation-reports-by-year.njk');
      expect((res._getRenderData() as FindUtilisationReportsByYearViewModel)?.selectedYear).toEqual('Nonsense');
    });

    it("renders the 'utilisation-reports-by-bank-and-year-results.njk' view with required data when there are valid query params", async () => {
      // Arrange
      const bankQuery = BANK_ID_ONE;
      const yearQuery = new Date().getFullYear().toString();
      const reportPeriod = {
        start: {
          month: 1,
          year: Number(yearQuery),
        },
        end: {
          month: 1,
          year: Number(yearQuery),
        },
      };
      const mockReportSummaryItem: UtilisationReportReconciliationSummaryItem = {
        reportId: '1',
        reportPeriod,
        bank: {
          id: bankQuery,
          name: BANK_NAME_ONE,
        },
        status: PENDING_RECONCILIATION,
        dateUploaded: '2024-02-15 10:38:01.4033333',
        totalFeesReported: 3,
        reportedFeesLeftToReconcile: 3,
      };

      const expectedReportItem = {
        reportId: '1',
        reportPeriod,
        bank: { id: bankQuery, name: BANK_NAME_ONE },
        status: PENDING_RECONCILIATION,
        dateUploaded: '2024-02-15 10:38:01.4033333',
        totalFeesReported: 3,
        reportedFeesLeftToReconcile: 3,
        formattedReportPeriod: 'January 2024',
        displayStatus: 'Pending reconciliation',
        formattedDateUploaded: '15 Feb 2024',
      };

      const { res, req } = httpMocks.createMocks({
        session: requestSession,
        query: { bank: bankQuery, year: yearQuery },
        originalUrl,
      });

      jest.mocked(api.getAllBanksWithReportingYears).mockResolvedValue(BANKS);
      jest.mocked(api.getReportSummariesByBankAndYear).mockResolvedValue({ bankName: BANK_NAME_ONE, year: yearQuery, reports: [mockReportSummaryItem] });

      // Act
      await getFindReportsByYear(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/utilisation-reports-by-bank-and-year-results.njk');
      expect((res._getRenderData() as UtilisationReportsByBankAndYearViewModel)?.bankName).toEqual(BANK_NAME_ONE);
      expect((res._getRenderData() as UtilisationReportsByBankAndYearViewModel)?.year).toEqual(yearQuery);
      expect((res._getRenderData() as UtilisationReportsByBankAndYearViewModel)?.reports).toStrictEqual([expectedReportItem]);
    });
  });
});
