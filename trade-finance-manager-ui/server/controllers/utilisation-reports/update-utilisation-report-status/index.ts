import { Response } from 'express';
import api from '../../../api';
import { asString } from '../../../helpers/validation';
import { ReportWithStatus } from '../../../types/utilisation-reports';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { getUtilisationReports } from '..';
import { asUserSession } from '../../../helpers/express-session';

const CHECKBOX_PREFIX_REGEX = 'set-status--';
const MONGO_ID_REGEX = '[a-f\\d]+';
const CHECKBOX_PATTERN = {
  WITHOUT_GROUPS: new RegExp(CHECKBOX_PREFIX_REGEX),
  WITH_GROUPS: new RegExp(`${CHECKBOX_PREFIX_REGEX}reportId-(?<id>${MONGO_ID_REGEX})`),
} as const;

const FORM_BUTTON_VALUES = {
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not-completed',
} as const;

export type UpdateUtilisationReportStatusRequestBody = {
  _csrf: string;
  'form-button': string;
  [key: `set-status--reportId-${string}`]: 'on';
};

const getReportIdsFromBody = (body: undefined | UpdateUtilisationReportStatusRequestBody): string[] => {
  if (!body || typeof body !== 'object') {
    throw new Error('Expected request body to be an object');  
  }

  return Object.keys(body)
    .filter((key) => key.match(CHECKBOX_PATTERN.WITHOUT_GROUPS))
    .map((setStatusKey): string => {
      const match = setStatusKey.match(CHECKBOX_PATTERN.WITH_GROUPS);
      if (!match?.groups) {
        throw new Error(`Failed to parse reportIds from request body key '${setStatusKey}'`);
      }

      const { id } = match.groups;
      return id;
    });
};

const getReportWithStatus = (reportId: string, formButton: string): ReportWithStatus => {
  switch (formButton) {
    case FORM_BUTTON_VALUES.COMPLETED:
      return {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        reportId,
      };
    case FORM_BUTTON_VALUES.NOT_COMPLETED:
      return {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
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
    const reportIds = getReportIdsFromBody(req.body);

    const { 'form-button': formButton } = req.body;
    const reportsWithStatus = reportIds
      .map((reportId) => getReportWithStatus(reportId, asString(formButton, 'formButton')));

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
