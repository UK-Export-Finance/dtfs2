import { Response, Request } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { RecordCorrectionRequestSentViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import api from '../../../../api';

const renderRequestSentPage = (res: Response, viewModel: RecordCorrectionRequestSentViewModel) =>
  res.render('utilisation-reports/record-corrections/request-sent.njk', viewModel);

/**
 * Renders the "request sent" page for a record correction request.
 *
 * Retrieves the record correction request emails from the session and renders
 * the "request sent" page.
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionRequestSent = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    const { recordCorrectionRequestEmails: emails } = req.session;
    delete req.session.recordCorrectionRequestEmails;

    if (!emails) {
      throw new Error('No record correction request emails are stored in the session.');
    }

    const feeRecord = await api.getFeeRecord(reportId, feeRecordId, userToken);

    const requestedByUserEmail = user.email;
    const emailsWithoutRequestedByUserEmail = emails.filter((email) => email !== requestedByUserEmail);

    return renderRequestSentPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: {
        name: feeRecord.bank.name,
      },
      reportId,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecord.reportPeriod),
      requestedByUserEmail,
      emailsWithoutRequestedByUserEmail,
    });
  } catch (error) {
    console.error('Failed to render create record correction request - "request sent" page', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
