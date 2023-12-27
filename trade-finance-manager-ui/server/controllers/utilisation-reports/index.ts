import { Request, Response } from 'express';
import { subMonths } from 'date-fns';
import api from '../../api';
import { getFormattedReportDueDate, getFormattedReportPeriod } from '../../services/utilisation-report-service';
import { getIsoMonth } from '../../helpers/date';
import { getReportReconciliationSummaryViewModel } from './helpers';
import { asString } from '../../helpers/validation';
import { TfmSessionUser } from '../../types/tfm-session-user';
import { ReportIdentifier, ReportWithStatus } from '../../types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';

/**
 * Gets the data required to render the /utilisation-reports page
 */
const getUtilisationReportsSummaryData = async (userToken: unknown) => {
  const currentDate = new Date();
  const oneIndexedMonth = subMonths(currentDate, 1).getMonth() + 1;
  const year = currentDate.getFullYear();

  const submissionMonth = getIsoMonth(currentDate);
  const reconciliationSummaryApiResponse = await api.getUtilisationReportsReconciliationSummary(submissionMonth, asString(userToken));

  const reportReconciliationSummary = getReportReconciliationSummaryViewModel(reconciliationSummaryApiResponse);
  const reportPeriod = getFormattedReportPeriod();
  const reportDueDate = await getFormattedReportDueDate(userToken);

  return {
    reportReconciliationSummary,
    reportPeriod,
    reportDueDate,
    month: oneIndexedMonth,
    year,
  };
};

export const getUtilisationReports = async (req: Request, res: Response) => {
  const { userToken, user } = req.session;

  try {
    const { reportReconciliationSummary, reportPeriod, reportDueDate, month, year } = await getUtilisationReportsSummaryData(userToken);

    return res.render('utilisation-reports/utilisation-reports.njk', {
      user,
      activePrimaryNavigation: 'utilisation reports',
      reportReconciliationSummary,
      reportPeriod,
      reportDueDate,
      month,
      year,
    });
  } catch (error) {
    console.error('Error rendering utilisation reports page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

const getReportIdentifiersFromUrl = (body: object, month: number, year: number): ReportIdentifier[] =>
  Object.keys(body).reduce((reportIdentifiers, key) => {
    const match = key.match(/(set-status--)(.*)(-)([a-f\d]+)/);
    if (!match) {
      return reportIdentifiers;
    }

    const idType = match.at(2);
    const id = match.at(4);

    if (!idType || !id) {
      throw new Error('Failed to parse report identifiers from request body');
    }

    if (idType === 'reportId') {
      return [...reportIdentifiers, { id }];
    }

    if (idType === 'bankId') {
      return [...reportIdentifiers, { bankId: id, month, year }];
    }

    throw new Error('Failed to parse report identifiers from request body');
  }, [] as ReportIdentifier[]);

export type UpdateReportStatusPayload = {
  reportsWithStatus: ReportWithStatus[];
  user: TfmSessionUser;
};

export const updateUtilisationReportStatus = async (req: Request, res: Response) => {
  const { user, userToken } = req.session;
  const { status, month, year } = req.query;

  try {
    if (!user) {
      throw new Error('User is not logged in');
    }

    const reportIdentifiers = getReportIdentifiersFromUrl(req.body as object, Number(month), Number(year));

    if (status !== 'completed' && status !== 'not-completed') {
      throw new Error('Supplied status instruction does not match any expected status');
    }
    const statusToSet =
      status === 'completed' ? UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED : UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;

    const reportsWithStatus = reportIdentifiers.map((reportIdentifier): ReportWithStatus => {
      if ('id' in reportIdentifier && statusToSet === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
        return {
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
          report: reportIdentifier,
        };
      }
      return { status: statusToSet, report: reportIdentifier };
    });

    const updateReportStatusPayload: UpdateReportStatusPayload = { user, reportsWithStatus };
    await api.updateUtilisationReportStatus(updateReportStatusPayload, asString(userToken));

    return await getUtilisationReports(req, res);
  } catch (error) {
    console.error('Error updating utilisation report statuses:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
