import httpMocks from 'node-mocks-http';
import { MonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';
import api from '../../../api';
import { getPreviousReports } from '.';
import { LOGIN_STATUS, PRIMARY_NAV_KEY } from '../../../constants';
import { PreviousUtilisationReportsResponseBody, UtilisationReportResponseBody } from '../../../api-response-types';

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

      const createPreviousQuarterlyReport = (id: number, reportPeriod: ReportPeriod): UtilisationReportResponseBody => ({
        bankId,
        status: 'PENDING_RECONCILIATION',
        uploadedByUser: null,
        azureFileInfo: null,
        dateUploaded: null,
        reportPeriod,
        id,
      });

    const createPreviousMonthlyReport = ({ id, month, year }: { id: number } & MonthAndYear): UtilisationReportResponseBody => ({
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

    const expectedLinksForPreviousReports2024 = [
      {
        text: 'January 2024',
        month: 'January',
        path: `/banks/${bankId}/utilisation-report-download/${1}`,
      },
      {
        text: 'February 2024',
        month: 'February',
        path: `/banks/${bankId}/utilisation-report-download/${2}`,
      },
      {
        text: 'March 2024',
        month: 'March',
        path: `/banks/${bankId}/utilisation-report-download/${3}`,
      },
    ];

    const expectedLinksForPreviousReports2023 = [
      {
        text: 'January 2023',
        month: 'January',
        path: `/banks/${bankId}/utilisation-report-download/${4}`,
      },
      {
        text: 'February 2023',
        month: 'February',
        path: `/banks/${bankId}/utilisation-report-download/${5}`,
      },
      {
        text: 'March 2023',
        month: 'March',
        path: `/banks/${bankId}/utilisation-report-download/${6}`,
      },
    ];

    const expectedLinksForPreviousReports2022 = [
      {
        text: 'January 2022',
        month: 'January',
        path: `/banks/${bankId}/utilisation-report-download/${7}`,
      },
      {
        text: 'February 2022',
        month: 'February',
        path: `/banks/${bankId}/utilisation-report-download/${8}`,
      },
      {
        text: 'March 2022',
        month: 'March',
        path: `/banks/${bankId}/utilisation-report-download/${9}`,
      },
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

      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: expectedNavItems,
        reportLinks: expectedLinksForPreviousReports2024,
        year: 2024,
      });
    });

    it.each([
      [2024, expectedLinksForPreviousReports2024],
      [2023, expectedLinksForPreviousReports2023],
      [2022, expectedLinksForPreviousReports2022],
    ])('renders the previous reports page with the correct reports when the target year query is %s', async (targetYear, expectedLinks) => {
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

      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: expectedNavItems,
        reportLinks: expectedLinks,
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

    it('renders previous reports page with quarterly reports described with start and end of period', async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const quarterlyReportOverlappingYears = createPreviousQuarterlyReport(1, { start: { month: 12, year: 2025 }, end: { month: 2, year: 2026 } });
      const quarterlyReportNotOverlappingYears = createPreviousQuarterlyReport(2, { start: { month: 3, year: 2026 }, end: { month: 5, year: 2026 } });
      apiGetPreviousReportsSpy.mockResolvedValue([
        {
          year: 2026,
          reports: [quarterlyReportNotOverlappingYears, quarterlyReportOverlappingYears],
        },
        {
          year: 2025,
          reports: [quarterlyReportOverlappingYears]
        }
      ]);
      const expectedNavItems = [{
        text: 2026,
        href: `?targetYear=${2026}`,
        attributes: { 'data-cy': `side-navigation-${2026}` },
        active: true,
      }, {
        text: 2025,
        href: `?targetYear=${2025}`,
        attributes: { 'data-cy': `side-navigation-${2025}` },
        active: false,
      }];
      const expectedLinks = [
        {
          text: 'Mar 2026 to May 2026 (quarterly)',
          month: 'May',
          path: `/banks/${bankId}/utilisation-report-download/${2}`,
        },
        {
          text: 'Dec 2025 to Feb 2026 (quarterly)',
          month: 'February',
          path: `/banks/${bankId}/utilisation-report-download/${1}`,
        },
      ];

      // Act
      await getPreviousReports(req, res);

      // Assert
      expect(res._getRenderView()).toBe('utilisation-report-service/previous-reports/previous-reports.njk');
      expect(res._getRenderData()).toEqual({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: expectedNavItems,
        reportLinks: expectedLinks,
        year: 2026,
      });
    });
  });
});
