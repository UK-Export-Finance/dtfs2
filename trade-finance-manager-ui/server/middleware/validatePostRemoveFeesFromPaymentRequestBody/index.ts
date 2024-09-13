import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { NextFunction, Response } from 'express';
import { asUserSession } from '../../helpers/express-session';
import { EditPaymentFormRequestBody, extractEditPaymentFormValues, RemoveFeesFromPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';
import { getEditPaymentsCheckboxIdsFromObjectKeys } from '../../helpers/edit-payments-table-checkbox-id-helper';
import { extractTotalSelectableFeeRecordsFromRequestBody } from '../../helpers/remove-fees-from-payment-helper';
import { ReconciliationForReportTab } from '../../types/reconciliation-for-report-tab';

type PostRemoveFeesFromPaymentRequest = CustomExpressRequest<{
  query: {
    redirectTab?: ReconciliationForReportTab;
  };
}>;

const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const redirectWithError = (
  req: PostRemoveFeesFromPaymentRequest,
  res: Response,
  reportId: string,
  paymentId: string,
  removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey,
) => {
  req.session.removeFeesFromPaymentErrorKey = removeFeesFromPaymentErrorKey;
  req.session.editPaymentFormValues = extractEditPaymentFormValues(req.body as EditPaymentFormRequestBody);

  const { redirectTab } = req.query;

  return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=${redirectTab}`);
};

const renderProblemWithServiceView = (req: PostRemoveFeesFromPaymentRequest, res: Response) => {
  const { user } = asUserSession(req.session);
  return res.render('_partials/problem-with-service.njk', { user });
};

export const validatePostRemoveFeesFromPaymentRequestBody = (req: PostRemoveFeesFromPaymentRequest, res: Response, next: NextFunction) => {
  const { reportId, paymentId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return renderProblemWithServiceView(req, res);
  }

  const totalSelectableFeeRecords = extractTotalSelectableFeeRecordsFromRequestBody(body);

  if (!totalSelectableFeeRecords) {
    return renderProblemWithServiceView(req, res);
  }

  const checkedCheckboxIds = getEditPaymentsCheckboxIdsFromObjectKeys(body);

  if (checkedCheckboxIds.length === 0) {
    return redirectWithError(req, res, reportId, paymentId, 'no-fee-records-selected');
  }

  if (checkedCheckboxIds.length === totalSelectableFeeRecords) {
    return redirectWithError(req, res, reportId, paymentId, 'all-fee-records-selected');
  }

  return next();
};
