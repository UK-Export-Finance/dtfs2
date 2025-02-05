import { Response, Request } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { asUserSession } from '../../../../helpers/express-session';
import api from '../../../../api';
import { mapToRecordCorrectionStatus } from '../../helpers/map-record-correction-status';
import { RecordCorrectionLogDetailsViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';

/**
 * Renders the "get record correction log details" page for a record correction log entry
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionLogDetails = async (req: Request, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { correctionId } = req.params;

    const { fields, bankName, reportPeriod } = await api.getRecordCorrectionLogDetailsById(correctionId, userToken);

    const { status, displayStatus } = mapToRecordCorrectionStatus(fields.isCompleted);

    const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(reportPeriod);

    const viewModel: RecordCorrectionLogDetailsViewModel = {
      user,
      mappedCorrectionLog: fields,
      status,
      displayStatus,
      formattedReportPeriod,
      bankName,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    };

    return res.render('utilisation-reports/record-corrections/record-correction-log-details.njk', viewModel);
  } catch (error) {
    console.error('Error getting record correction log details: %o', error);

    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
