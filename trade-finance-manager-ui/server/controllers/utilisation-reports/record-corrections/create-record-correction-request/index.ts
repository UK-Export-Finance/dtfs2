import { Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import api from '../../../../api';

export type CreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

const renderCreateRecordCorrectionRequestPage = (res: Response, context: CreateRecordCorrectionRequestViewModel) =>
  res.render('utilisation-reports/record-corrections/create-record-correction-request.njk', context);

export const createRecordCorrectionRequest = async (req: CreateRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId, feeRecordId } = req.params;

    const feeRecordDetails = await api.getFeeRecordDetails(reportId, feeRecordId, userToken);

    return renderCreateRecordCorrectionRequestPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      bank: feeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecordDetails.reportPeriod),
      feeRecord: {
        facilityId: feeRecordDetails.facilityId,
        exporter: feeRecordDetails.exporter,
      },
    });
  } catch (error) {
    console.error('Failed to create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
