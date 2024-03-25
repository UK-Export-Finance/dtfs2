import httpMocks from 'node-mocks-http';
import { MonthAndYear } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getPreviousReports } from '.';
import { LOGIN_STATUS, PRIMARY_NAV_KEY } from '../../../constants';
import { PreviousUtilisationReportsResponseBody } from '../../../api-response-types';
import { getMonthName } from '../../../helpers/getMonthName';

type PreviousReport = PreviousUtilisationReportsResponseBody[number]['reports'][number];

describe('previous-reports controller', () => {
  describe('getPreviousReports', () => {
    const bankId = '123';
    const mockUser = {
      bank: {
        id: bankId,
      },
    };

    const apiGetPreviousReportsSpy = jest.spyOn(api, 'getPreviousUtilisationReportsByBank');

    const getHttpMocks = (targetYear?: string) =>
      httpMocks.createMocks({
        session: {
          user: mockUser,
          userToken: 'token',
          loginStatus: LOGIN_STATUS.VALID_2FA,
        },
        query: {
          targetYear,
        },
      });

    const createPreviousMonthlyReport = ({ id, month, year }: { id: number } & MonthAndYear): PreviousReport => ({
      bankId,
      status: 'PENDING_RECONCILIATION',
      uploadedByUser: null,
      azureFileInfo: null,
      dateUploaded: null,
      reportPeriod: {
        start: { month, year },
        end: { month, year },
      },
      id,
    });

    const previousReports2024 = [
      createPreviousMonthlyReport({ id: 1, month: 1, year: 2024 }),
      createPreviousMonthlyReport({ id: 2, month: 2, year: 2024 }),
      createPreviousMonthlyReport({ id: 3, month: 3, year: 2024 }),
    ];

    const previousReports2023 = [
      createPreviousMonthlyReport({ id: 4, month: 1, year: 2023 }),
      createPreviousMonthlyReport({ id: 5, month: 2, year: 2023 }),
      createPreviousMonthlyReport({ id: 6, month: 3, year: 2023 }),
    ];

    const previousReports2022 = [
      createPreviousMonthlyReport({ id: 7, month: 1, year: 2022 }),
      createPreviousMonthlyReport({ id: 8, month: 2, year: 2022 }),
      createPreviousMonthlyReport({ id: 9, month: 3, year: 2022 }),
    ];

    const previousReportsResponseBody: PreviousUtilisationReportsResponseBody = [
      {
        year: 2024,
        reports: previousReports2024,
      },
      {
        year: 2023,
        reports: previousReports2023,
      },
      {
        year: 2022,
        reports: previousReports2022,
      },
    ];

    const allTargetYearsToTest = previousReportsResponseBody.map(({ year }) => year);

    it('renders the previous reports page with the most recent year as the active nav item when no target year is provided', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      apiGetPreviousReportsSpy.mockResolvedValue(previousReportsResponseBody);

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(res._getRenderView()).toBe('utilisation-report-service/previous-reports/previous-reports.njk');

      const expectedNavItems = previousReportsResponseBody.map((groupedReports) => ({
        text: groupedReports.year,
        href: `?targetYear=${groupedReports.year}`,
        attributes: { 'data-cy': `side-navigation-${groupedReports.year}` },
        active: groupedReports.year === 2024,
      }));

      const expectedReportLinks = previousReports2024.map(({ reportPeriod, id }) => ({
        month: getMonthName(reportPeriod.start.month),
        path: `/banks/${bankId}/utilisation-report-download/${id}`,
      }));

      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: expectedNavItems,
        reportLinks: expectedReportLinks,
        year: 2024,
      });
    });

    it.each(allTargetYearsToTest)('renders the previous reports page with the correct reports when the target year query is %s', async (targetYear) => {
      // Arrange
      const { req, res } = getHttpMocks(targetYear.toString());
      apiGetPreviousReportsSpy.mockResolvedValue(previousReportsResponseBody);

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(res._getRenderView()).toBe('utilisation-report-service/previous-reports/previous-reports.njk');

      const expectedNavItems = previousReportsResponseBody.map((groupedReports) => ({
        text: groupedReports.year,
        href: `?targetYear=${groupedReports.year}`,
        attributes: { 'data-cy': `side-navigation-${groupedReports.year}` },
        active: groupedReports.year === targetYear,
      }));

      const expectedReportLinks = previousReportsResponseBody
        .find(({ year }) => year === targetYear)!
        .reports.map(({ reportPeriod, id }) => ({
          month: getMonthName(reportPeriod.start.month),
          path: `/banks/${bankId}/utilisation-report-download/${id}`,
        }));

      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: expectedNavItems,
        reportLinks: expectedReportLinks,
        year: targetYear,
      });
    });

    it('renders the previous reports page with default values when there are no previous reports', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      apiGetPreviousReportsSpy.mockResolvedValue([]);

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(res._getRenderView()).toBe('utilisation-report-service/previous-reports/previous-reports.njk');
      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: [],
        reportLinks: [],
        year: undefined,
      });
    });
  });
});
