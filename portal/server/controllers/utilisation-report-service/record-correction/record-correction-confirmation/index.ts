import { Request, Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { RecordCorrectionConfirmationViewModel } from '../../../../types/view-models/record-correction/record-correction-confirmation';

export type GetRecordCorrectionConfirmationRequest = Request & {
  params: {
    correctionId: string;
  };
};

const renderRecordCorrectionConfirmationPage = (res: Response, viewModel: RecordCorrectionConfirmationViewModel) =>
  res.render('utilisation-report-service/record-correction/confirmation.njk', viewModel);

/**
 * Controller for the GET record correction confirmation route.
 * @param req - The request object
 * @param res - The response object
 */
export const getRecordCorrectionConfirmation = (req: GetRecordCorrectionConfirmationRequest, res: Response) => {
  const { user, recordCorrectionConfirmation } = asLoggedInUserSession(req.session);

  try {
    if (!recordCorrectionConfirmation) {
      throw new Error('No record correction confirmation data found in session');
    }

    const { sentToEmails, reportPeriod } = recordCorrectionConfirmation;

    delete (req.session as LoggedInUserSession).recordCorrectionConfirmation;

    return renderRecordCorrectionConfirmationPage(res, {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
      sentToEmails,
    });
  } catch (error) {
    console.error('Failed to get record correction confirmation page %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
