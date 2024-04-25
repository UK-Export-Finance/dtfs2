import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth, getFormattedReportPeriodWithShortMonth, isEqualMonthAndYear } from '@ukef/dtfs2-common';
import { getMonthName } from '../../../helpers/getMonthName';
import api from '../../../api';
import { PRIMARY_NAV_KEY } from '../../../constants';
import { asLoggedInUserSession } from '../../../helpers/express-session';

type GetPreviousReportsRequest = Request & {
  query: {
    targetYear?: string;
  };
};

export const getPreviousReports = async (req: GetPreviousReportsRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);
  const { targetYear: targetYearQuery } = req.query;
  const bankId = user.bank.id;

  try {
    const previousReportsByBank = await api.getPreviousUtilisationReportsByBank(userToken, bankId);
    if (previousReportsByBank.length === 0) {
      return res.render('utilisation-report-service/previous-reports/previous-reports.njk', {
        user,
        primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
        navItems: [],
        reportLinks: [],
        year: undefined,
      });
    }

    const targetYear: number = targetYearQuery ? Number(targetYearQuery) : previousReportsByBank[0].year;

    const navItems = previousReportsByBank.map((groupedUtilisationReports) => ({
      text: groupedUtilisationReports.year,
      href: `?targetYear=${groupedUtilisationReports.year}`,
      attributes: { 'data-cy': `side-navigation-${groupedUtilisationReports.year}` },
      active: groupedUtilisationReports.year === targetYear,
    }));

    const activeYearIndex = navItems.findIndex(({ active }) => active);
    const previousReportsInTargetYear = activeYearIndex === -1 ? previousReportsByBank[0] : previousReportsByBank[activeYearIndex];

    const reportLinks = previousReportsInTargetYear.reports.map(({ reportPeriod, id }) => ({
      month: getMonthName(reportPeriod.end.month),
      text: isEqualMonthAndYear(reportPeriod.start, reportPeriod.end)
        ? getFormattedReportPeriodWithLongMonth(reportPeriod)
        : getFormattedReportPeriodWithShortMonth(reportPeriod, true, true),
      path: `/banks/${bankId}/utilisation-report-download/${id}`,
    }));

    return res.render('utilisation-report-service/previous-reports/previous-reports.njk', {
      user,
      primaryNav: PRIMARY_NAV_KEY.PREVIOUS_REPORTS,
      navItems,
      reportLinks,
      year: targetYear,
    });
  } catch (error) {
    console.error('Failed to get previous reports: %s', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
