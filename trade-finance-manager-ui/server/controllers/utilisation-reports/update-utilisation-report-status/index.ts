import { Response } from 'express';
import {
  UtilisationReportStatus,
  UTILISATION_REPORT_STATUS,
  ReportWithStatus,
  asString,
  PENDING_RECONCILIATION,
  RECONCILIATION_COMPLETED,
} from '@ukef/dtfs2-common';
import api from '../../../api';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { getUtilisationReports } from '..';
import { asUserSession } from '../../../helpers/express-session';

const CHECKBOX_PREFIX_REGEX = 'set-status--';
const SQL_ID_REGEX = '\\d+';
const UTILISATION_REPORT_STATUS_REGEX = Object.values(UTILISATION_REPORT_STATUS).join('|');
const CHECKBOX_PATTERN = {
  WITHOUT_GROUPS: new RegExp(CHECKBOX_PREFIX_REGEX),
  WITH_GROUPS: new RegExp(`${CHECKBOX_PREFIX_REGEX}reportId-(?<id>${SQL_ID_REGEX})-currentStatus-(?<currentStatus>${UTILISATION_REPORT_STATUS_REGEX})`),
} as const;

const FORM_BUTTON_VALUES = {
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not-completed',
} as const;

export type UpdateUtilisationReportStatusRequestBody = {
  _csrf: string;
  'form-button': string;
  [key: `set-status--reportId-${string}-currentStatus-${UtilisationReportStatus}`]: 'on';
};

const getReportIdsAndStatusesFromBody = (body: undefined | UpdateUtilisationReportStatusRequestBody): { id: number; status: UtilisationReportStatus }[] => {
  if (!body || typeof body !== 'object') {
    throw new Error('Expected request body to be an object');
  }

  return Object.keys(body)
    .filter((key) => key.match(CHECKBOX_PATTERN.WITHOUT_GROUPS))
    .map((setStatusKey) => {
      const match = setStatusKey.match(CHECKBOX_PATTERN.WITH_GROUPS);
      if (!match?.groups) {
        throw new Error(`Failed to parse reportIds from request body key '${setStatusKey}'`);
      }

      const { id, currentStatus } = match.groups;
      return { id: Number(id), status: currentStatus as UtilisationReportStatus };
    });
};

const getReportWithStatus = (reportId: number, formButton: string): ReportWithStatus => {
  switch (formButton) {
    case FORM_BUTTON_VALUES.COMPLETED:
      return {
        status: RECONCILIATION_COMPLETED,
        reportId,
      };
    case FORM_BUTTON_VALUES.NOT_COMPLETED:
      return {
        status: PENDING_RECONCILIATION,
        reportId,
      };
    default:
      throw new Error(
        `form-button body parameter of '${formButton}' does not match either '${FORM_BUTTON_VALUES.COMPLETED}' or '${FORM_BUTTON_VALUES.NOT_COMPLETED}'`,
      );
  }
};

export type UpdateUtilisationReportStatusRequest = CustomExpressRequest<{
  reqBody: UpdateUtilisationReportStatusRequestBody;
}>;

export const updateUtilisationReportStatus = async (req: UpdateUtilisationReportStatusRequest, res: Response) => {
  const { user, userToken } = asUserSession(req.session);

  try {
    const reportIdsAndStatuses = getReportIdsAndStatusesFromBody(req.body);

    const { 'form-button': formButton } = req.body;
    const reportsWithStatus = reportIdsAndStatuses.reduce((acc, { id, status }) => {
      const reportWithStatus = getReportWithStatus(id, asString(formButton, 'formButton'));
      if (reportWithStatus.status === status) {
        return acc;
      }
      return [...acc, reportWithStatus];
    }, [] as ReportWithStatus[]);

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
