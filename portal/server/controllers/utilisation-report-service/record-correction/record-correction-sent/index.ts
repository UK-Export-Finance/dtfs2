import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { RecordCorrectionSentViewModel } from '../../../../types/view-models/record-correction/record-correction-confirmation';

/**
 * Controller for the GET record correction sent route.
 *
 * Retrieves the record correction sent data from the session and then deletes it.
 *
 * @param req - The request object
 * @param res - The response object
 */
export const getRecordCorrectionSent = (req: Request, res: Response) => {
  const { user, recordCorrectionSent } = asLoggedInUserSession(req.session);

  try {
    if (!recordCorrectionSent) {
      throw new Error('No record correction sent data found in session');
    }

    const { sentToEmails, reportPeriod } = recordCorrectionSent;

    delete (req.session as LoggedInUserSession).recordCorrectionSent;

    const viewModel: RecordCorrectionSentViewModel = {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
      sentToEmails,
    };

    return res.render('utilisation-report-service/record-correction/correction-sent.njk', viewModel);
  } catch (error) {
    console.error('Failed to get record correction sent page %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
