import { UTILISATION_REPORT_STATUS, UtilisationReportReconciliationStatus, aPortalSessionUser } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { PreviousUtilisationReportsResponseBody, UtilisationReportResponseBody } from '../../../../api-response-types';
import { mapToPreviousReportsViewModel } from './previous-reports-view-model-mapper';
import { aUtilisationReportResponse } from '../../../../../test-helpers/test-data/utilisation-report';

describe('previous-reports-view-model-mapper', () => {
  describe('mapToPreviousReportsViewModel', () => {
    it('returns with no navItems or reports and year undefined when there are no previous reports', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [];

      // Act
      const result = mapToPreviousReportsViewModel('2023', user, responseBody);

      // Assert
      expect(result).toEqual({
        user,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: [],
        reports: [],
        year: undefined,
      });
    });

    it('sets the year to the target year query when provided', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [] },
        { year: 2023, reports: [] },
      ];
      const targetYearQuery = '2023';

      // Act
      const result = mapToPreviousReportsViewModel(targetYearQuery, user, responseBody);

      // Assert
      expect(result.year).toEqual(2023);
    });

    it('sets the year to the year of the first response group if no target year query is undefined', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [] },
        { year: 2023, reports: [] },
      ];
      const targetYearQuery = undefined;

      // Act
      const result = mapToPreviousReportsViewModel(targetYearQuery, user, responseBody);

      // Assert
      expect(result.year).toEqual(2024);
    });

    it('creates a nav item for each year the response body contains a group of reports for with the target year active', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [] },
        { year: 2023, reports: [] },
      ];

      // Act
      const result = mapToPreviousReportsViewModel('2023', user, responseBody);

      // Assert
      expect(result.navItems).toHaveLength(2);
      expect(result.navItems[0]).toEqual({
        text: 2024,
        href: '?targetYear=2024',
        attributes: { 'data-cy': 'side-navigation-2024' },
        active: false,
      });
      expect(result.navItems[1]).toEqual({
        text: 2023,
        href: '?targetYear=2023',
        attributes: { 'data-cy': 'side-navigation-2023' },
        active: true,
      });
    });

    it('sets user to provided user', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [] },
        { year: 2023, reports: [] },
      ];

      // Act
      const result = mapToPreviousReportsViewModel('2023', user, responseBody);

      // Assert
      expect(result.user).toEqual(user);
    });

    it('sets primary nav to previous reports', () => {
      // Arrange
      const user = aPortalSessionUser();
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [] },
        { year: 2023, reports: [] },
      ];

      // Act
      const result = mapToPreviousReportsViewModel('2023', user, responseBody);

      // Assert
      expect(result.primaryNav).toEqual(PRIMARY_NAV_KEY.PREVIOUS_REPORTS);
    });

    it('maps all reports from active year', () => {
      // Arrange
      const user = aPortalSessionUser();
      const reportNotInTargetYear: UtilisationReportResponseBody = { ...aUtilisationReportResponse(), id: 1 };
      const reportInTargetYear: UtilisationReportResponseBody = { ...aUtilisationReportResponse(), id: 2 };
      const anotherReportInTargetYear: UtilisationReportResponseBody = { ...aUtilisationReportResponse(), id: 3 };
      const responseBody: PreviousUtilisationReportsResponseBody = [
        { year: 2024, reports: [reportNotInTargetYear] },
        { year: 2023, reports: [reportInTargetYear, anotherReportInTargetYear] },
      ];

      // Act
      const result = mapToPreviousReportsViewModel('2023', user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(2);
      expect(result.reports[0].downloadPath).toContain('/utilisation-report-download/2');
      expect(result.reports[1].downloadPath).toContain('/utilisation-report-download/3');
    });

    it.each`
      status                                                  | displayStatus
      ${UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED}        | ${'Not submitted'}
      ${UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION}     | ${'Pending reconciliation'}
      ${UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS} | ${'Reconciliation in progress'}
      ${UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED}   | ${'Report completed'}
    `(
      'maps status and sets display status to $displayStatus when report status is $status',
      ({ status, displayStatus }: { status: UtilisationReportReconciliationStatus; displayStatus: string }) => {
        // Arrange
        const user = aPortalSessionUser();
        const report: UtilisationReportResponseBody = {
          ...aUtilisationReportResponse(),
          status,
        };
        const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

        // Act
        const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

        // Assert
        expect(result.reports).toHaveLength(1);
        expect(result.reports[0].status).toEqual(status);
        expect(result.reports[0].displayStatus).toEqual(displayStatus);
      },
    );

    it('sets the link text to the long month and year when report is monthly', () => {
      // Arrange
      const user = aPortalSessionUser();
      const report: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        reportPeriod: { start: { month: 1, year: 2024 }, end: { month: 1, year: 2024 } },
      };
      const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

      // Act
      const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].linkText).toEqual('January 2024');
    });

    it('sets the link text to the formatted report period with short months and the word quarterly when report period is more than one month', () => {
      // Arrange
      const user = aPortalSessionUser();
      const report: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        reportPeriod: { start: { month: 3, year: 2024 }, end: { month: 5, year: 2024 } },
      };
      const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

      // Act
      const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].linkText).toEqual('Mar 2024 to May 2024 (quarterly)');
    });

    it('sets the report month to be the end month of the report period when report is quarterly', () => {
      // Arrange
      const user = aPortalSessionUser();
      const report: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        reportPeriod: { start: { month: 3, year: 2024 }, end: { month: 5, year: 2024 } },
      };
      const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

      // Act
      const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].month).toEqual('May');
    });

    it('sets the report month to be the month of the report when the report period is monthly', () => {
      // Arrange
      const user = aPortalSessionUser();
      const report: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        reportPeriod: { start: { month: 3, year: 2024 }, end: { month: 3, year: 2024 } },
      };
      const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

      // Act
      const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].month).toEqual('March');
    });

    it("sets constructs and sets the report download path using the user's bank id and the report id", () => {
      // Arrange
      const user = aPortalSessionUser();
      user.bank.id = '123';
      const report: UtilisationReportResponseBody = {
        ...aUtilisationReportResponse(),
        id: 456,
      };
      const responseBody: PreviousUtilisationReportsResponseBody = [{ year: 2024, reports: [report] }];

      // Act
      const result = mapToPreviousReportsViewModel(undefined, user, responseBody);

      // Assert
      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].downloadPath).toEqual('/banks/123/utilisation-report-download/456');
    });
  });
});
