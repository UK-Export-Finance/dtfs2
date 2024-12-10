import { Response, Request } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { RecordCorrectionRequestSentViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import api from '../../../../api';

const renderRequestSentPage = (res: Response, viewModel: RecordCorrectionRequestSentViewModel) =>
  res.render('utilisation-reports/record-corrections/request-sent.njk', viewModel);

/**
 * Renders the "request sent" page for a record correction request
 * @param req - the request
 * @param res - the response
 */
// TODO FN-3581: Add tests for this new controller.
export const getRecordCorrectionRequestSent = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    const feeRecord = await api.getFeeRecord(reportId, feeRecordId, userToken);

    const emails = req.session.recordCorrectionRequestEmails;

    if (!emails) {
      // TODO FN-3581: Throw instead?
      return res.render('_partials/problem-with-service.njk', { user: req.session.user });
    }

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
