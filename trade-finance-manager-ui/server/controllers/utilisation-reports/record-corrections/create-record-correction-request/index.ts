import { Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';

export type CreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

const renderCreateRecordCorrectionRequestPage = (res: Response, context: CreateRecordCorrectionRequestViewModel) =>
  res.render('utilisation-reports/record-corrections/create-record-correction-request.njk', context);

export const createRecordCorrectionRequest = (req: CreateRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { user } = asUserSession(req.session);
    const { reportId } = req.params;

    // TODO: In a subsequent PR, add a new endpoint which returns minimal data, called getFeeRecord (or other generic)
    const selectedFeeRecordDetails = {
      bank: {
        name: 'Test Bank',
      },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
    };

    return renderCreateRecordCorrectionRequestPage(res, {
      user,
      reportId,
      bank: selectedFeeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(selectedFeeRecordDetails.reportPeriod),
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    });
  } catch (error) {
    console.error('Failed to create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
