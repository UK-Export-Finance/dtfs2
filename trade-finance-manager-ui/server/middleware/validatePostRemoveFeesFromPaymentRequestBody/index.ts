import { NextFunction, Response } from 'express';
import { asUserSession } from '../../helpers/express-session';
import { extractEditPaymentFormValues, RemoveFeesFromPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';
import { RemoveFeesFromPaymentRequest } from '../../controllers/utilisation-reports/remove-fees-from-payment';
import { getEditPaymentsCheckboxIdsFromObjectKeys } from '../../helpers/edit-payments-table-checkbox-id-helper';
import { extractTotalSelectableFeeRecordsFromRequestBody } from '../../helpers/remove-fees-from-payment-helper';

const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const redirectWithError = (
  req: RemoveFeesFromPaymentRequest,
  res: Response,
  reportId: string,
  paymentId: string,
  removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey,
) => {
  req.session.removeFeesFromPaymentErrorKey = removeFeesFromPaymentErrorKey;
  req.session.editPaymentFormValues = extractEditPaymentFormValues(req.body);

  return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
};

const renderProblemWithServiceView = (req: RemoveFeesFromPaymentRequest, res: Response) => {
  const { user } = asUserSession(req.session);
  return res.render('_partials/problem-with-service.njk', { user });
};

export const validatePostRemoveFeesFromPaymentRequestBody = (req: RemoveFeesFromPaymentRequest, res: Response, next: NextFunction) => {
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
