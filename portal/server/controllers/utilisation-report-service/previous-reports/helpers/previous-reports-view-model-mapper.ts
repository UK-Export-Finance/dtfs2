import {
  UtilisationReportStatus,
  getFormattedReportPeriodWithLongMonth,
  getFormattedReportPeriodWithShortMonth,
  isEqualMonthAndYear,
  PortalSessionUser,
  getMonthName,
} from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { PreviousUtilisationReportsResponseBody, UtilisationReportResponseBody } from '../../../../api-response-types';
import { PreviousReportNavItemViewModel, PreviousReportViewModel, PreviousReportsViewModel } from '../../../../types/view-models/previous-reports';

const reconciliationStatusCodeToDisplayStatus: Record<UtilisationReportStatus, string> = {
  REPORT_NOT_RECEIVED: 'Not submitted',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

const mapToPreviousReportNavItemViewModel = (year: number, targetYear: number): PreviousReportNavItemViewModel => ({
  text: year,
  href: `?targetYear=${year}`,
  attributes: { 'data-cy': `side-navigation-${year}` },
  active: year === targetYear,
});

const mapToPreviousReportViewModel = (report: UtilisationReportResponseBody, user: PortalSessionUser): PreviousReportViewModel => ({
  status: report.status,
  displayStatus: reconciliationStatusCodeToDisplayStatus[report.status],
  month: getMonthName(report.reportPeriod.end.month),
  linkText: isEqualMonthAndYear(report.reportPeriod.start, report.reportPeriod.end)
    ? getFormattedReportPeriodWithLongMonth(report.reportPeriod)
    : getFormattedReportPeriodWithShortMonth(report.reportPeriod, true, true),
  downloadPath: `/banks/${user.bank.id}/utilisation-report-download/${report.id}`,
});

export const mapToPreviousReportsViewModel = (
  targetYearQuery: string | undefined,
  user: PortalSessionUser,
  previousReportsByBank: PreviousUtilisationReportsResponseBody,
): PreviousReportsViewModel => {
  if (previousReportsByBank.length === 0) {
    return {
      user,
      primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
      navItems: [],
      reports: [],
      year: undefined,
    };
  }

  const targetYear: number = targetYearQuery ? Number(targetYearQuery) : previousReportsByBank[0].year;
  const navItems = previousReportsByBank.map(({ year }) => mapToPreviousReportNavItemViewModel(year, targetYear));
  const activeYearIndex = navItems.findIndex(({ active }) => active);
  const previousReportsInTargetYear = activeYearIndex === -1 ? previousReportsByBank[0] : previousReportsByBank[activeYearIndex];
  const reports = previousReportsInTargetYear.reports.map((report) => mapToPreviousReportViewModel(report, user));

  return {
    user,
    primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
    navItems,
    reports,
    year: targetYear,
  };
};
