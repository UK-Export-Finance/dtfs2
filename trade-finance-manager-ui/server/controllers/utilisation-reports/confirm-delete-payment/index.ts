import { Response } from 'express';
import { format } from 'date-fns';
import { getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import api from '../../../api';
import { GetPaymentDetailsWithoutFeeRecordsResponseBody } from '../../../api-response-types';
import { ConfirmDeletePaymentViewModel } from '../../../types/view-models';
import { asUserSession } from '../../../helpers/express-session';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { ReconciliationForReportTab } from '../../../types/reconciliation-for-report-tab';
import { getReconciliationForReportHref } from '../helpers';

const renderConfirmDeletePayment = (res: Response, viewModel: ConfirmDeletePaymentViewModel) =>
  res.render('utilisation-reports/confirm-delete-payment.njk', viewModel);

const getPaymentSummaryListRows = (paymentResponse: GetPaymentDetailsWithoutFeeRecordsResponseBody) => {
  const formattedDateReceived = format(new Date(paymentResponse.payment.dateReceived), 'd MMM yyyy');
  return [
    {
      key: { text: 'Amount' },
      value: { text: getFormattedCurrencyAndAmount(paymentResponse.payment) },
    },
    {
      key: { text: 'Payment reference' },
      value: { text: paymentResponse.payment.reference ?? '' },
    },
    {
      key: { text: 'Date received' },
      value: { text: formattedDateReceived },
    },
  ];
};

type GetConfirmDeletePaymentRequest = CustomExpressRequest<{
  query: {
    redirectTab?: ReconciliationForReportTab;
  };
}>;

export const getConfirmDeletePayment = async (req: GetConfirmDeletePaymentRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { userToken, user } = asUserSession(req.session);
  const { redirectTab } = req.query;

  try {
    const paymentResponse = await api.getPaymentDetailsWithoutFeeRecords(reportId, paymentId, userToken);

    const paymentSummaryListRows = getPaymentSummaryListRows(paymentResponse);

    return renderConfirmDeletePayment(res, { paymentSummaryListRows, redirectTab });
  } catch (error) {
    console.error('Failed to render confirm delete payment page', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

type PostConfirmDeletePaymentRequest = CustomExpressRequest<{
  reqBody: {
    confirmDeletePayment?: 'yes' | 'no';
  };
  query: {
    redirectTab?: ReconciliationForReportTab;
  };
}>;

export const postConfirmDeletePayment = async (req: PostConfirmDeletePaymentRequest, res: Response) => {
  const { user, userToken } = asUserSession(req.session);
  const { reportId, paymentId } = req.params;
  const { confirmDeletePayment } = req.body;
  const { redirectTab } = req.query;

  try {
    if (confirmDeletePayment === 'yes') {
      await api.deletePaymentById(reportId, paymentId, user, userToken);
      return res.redirect(getReconciliationForReportHref(reportId, redirectTab));
    }

    return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=${redirectTab}`);
  } catch (error) {
    console.error('Failed to delete payment', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
