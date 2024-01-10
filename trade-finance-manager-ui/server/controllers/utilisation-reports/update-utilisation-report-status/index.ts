import { Request, Response } from 'express';
import api from '../../../api';
import { asString } from '../../../helpers/validation';
import { ReportIdentifier, ReportWithStatus } from '../../../types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { getUtilisationReports } from '..';
import { asUserSession } from '../../../helpers/express-session';
import { assertValidIsoMonth } from '../../../helpers/date';
import { getReportPeriodStart } from '../../../services/utilisation-report-service';

const CHECKBOX_PREFIX_REGEX = 'set-status--';
const CHECKBOX_ID_TYPE_REGEX = 'reportId|bankId';
const MONGO_ID_REGEX = '[a-f\\d]+';
const CHECKBOX_PATTERN = {
  WITHOUT_GROUPS: new RegExp(CHECKBOX_PREFIX_REGEX),
  WITH_GROUPS: new RegExp(`${CHECKBOX_PREFIX_REGEX}(?<idType>${CHECKBOX_ID_TYPE_REGEX})-(?<id>${MONGO_ID_REGEX})`),
} as const;

const FORM_BUTTON_VALUES = {
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not-completed',
} as const;

const getReportIdentifiersFromBody = (body: unknown, month: number, year: number): ReportIdentifier[] => {
  if (!body || typeof body !== 'object') {
    return [];
  }

  return Object.keys(body)
    .filter((key) => key.match(CHECKBOX_PATTERN.WITHOUT_GROUPS))
    .map((setStatusKey): ReportIdentifier => {
      const match = setStatusKey.match(CHECKBOX_PATTERN.WITH_GROUPS);
      if (!match?.groups) {
        throw new Error(`Failed to parse report identifiers from request body key '${setStatusKey}'`);
      }

      const { idType, id } = match.groups;
      switch (idType) {
        case 'reportId':
          return { id };
        case 'bankId':
          return { bankId: id, month, year };
        default:
          throw new Error('Failed to parse report identifiers from request body');
      }
    });
};

const getReportWithStatus = (reportIdentifier: ReportIdentifier, formButton: string): ReportWithStatus | undefined => {
  switch (formButton) {
    case FORM_BUTTON_VALUES.COMPLETED:
      return {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: reportIdentifier,
      };
    case FORM_BUTTON_VALUES.NOT_COMPLETED:
      if ('bankId' in reportIdentifier) {
        // If a user tries to mark a non-existing report as "not done", we simply ignore that part of the request
        return undefined;
      }
      return {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
        report: reportIdentifier,
      };
    default:
      throw new Error(
        `form-button query parameter of '${formButton}' does not match either '${FORM_BUTTON_VALUES.COMPLETED}' or '${FORM_BUTTON_VALUES.NOT_COMPLETED}'`,
      );
  }
};

type UpdateUtilisationReportStatusRequestBody = {
  _csrf: string;
  'form-button': string;
  'submission-month': string;
} & {
  [key: string]: 'on'; // all checkboxes in payload have value 'on'
};

interface UpdateUtilisationReportStatusRequest extends Request {
  body: UpdateUtilisationReportStatusRequestBody;
}

export const updateUtilisationReportStatus = async (req: UpdateUtilisationReportStatusRequest, res: Response) => {
  const { user, userToken } = asUserSession(req.session);

  try {
    const { 'form-button': formButton, 'submission-month': submissionMonth } = req.body;
    assertValidIsoMonth(submissionMonth);
    const reportPeriodStart = getReportPeriodStart(submissionMonth);

    const reportIdentifiers = getReportIdentifiersFromBody(req.body, reportPeriodStart.month, reportPeriodStart.year);
    const reportsWithStatus = reportIdentifiers
      .map((reportIdentifier) => getReportWithStatus(reportIdentifier, asString(formButton, 'formButton')))
      .filter((reportWithStatus): reportWithStatus is ReportWithStatus => !!reportWithStatus);

    if (reportsWithStatus.length === 0) {
      return await getUtilisationReports(req, res);
    }

    await api.updateUtilisationReportStatus(user, reportsWithStatus, userToken);
    return await getUtilisationReports(req, res);
  } catch (error) {
    console.error('Error updating utilisation report status:', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
