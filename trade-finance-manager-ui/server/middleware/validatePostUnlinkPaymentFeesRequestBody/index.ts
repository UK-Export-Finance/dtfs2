import { NextFunction, Request, Response } from 'express';
import { asUserSession } from '../../helpers/express-session';
import { UnlinkPaymentFeesErrorKey } from '../../controllers/utilisation-reports/helpers';
import { getEditPremiumPaymentsCheckboxIdsFromObjectKeys } from '../../helpers/edit-premium-payments-table-checkbox-id-helper';

const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const redirectWithError = (
  req: Request,
  res: Response,
  reportId: string,
  paymentId: string,
  unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey,
  checkedCheckboxIds: Record<string, true | undefined> = {},
) => {
  req.session.unlinkPaymentFeesErrorKey = unlinkPaymentFeesErrorKey;
  req.session.checkedCheckboxIds = checkedCheckboxIds;
  return res.redirect(`/utilisation-reports/${reportId}/edit-payment/${paymentId}`);
};

const renderProblemWithServiceView = (req: Request, res: Response) => {
  const { user } = asUserSession(req.session);
  return res.render('_partials/problem-with-service.njk', { user });
};

// TODO: Could we pull all these body types and the extraction func out into another file?
type UnlinkPaymentFeesFormRequestBody = {
  totalSelectableFeeRecords?: string;
};

type UnlinkPaymentFeesFormValues = {
  totalSelectableFeeRecords?: string;
};

const extractTotalSelectableFeeRecords = (requestBody: UnlinkPaymentFeesFormRequestBody): UnlinkPaymentFeesFormValues => {
  return {
    totalSelectableFeeRecords: requestBody.totalSelectableFeeRecords,
  };
};

export const validatePostUnlinkPaymentFeesRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { reportId, paymentId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return renderProblemWithServiceView(req, res);
  }

  const formValues = extractTotalSelectableFeeRecords(body);
  const checkedCheckboxIds = getEditPremiumPaymentsCheckboxIdsFromObjectKeys(body);

  if (checkedCheckboxIds.length === 0) {
    return redirectWithError(req, res, reportId, paymentId, 'no-fee-records-selected');
  }

  if (!formValues.totalSelectableFeeRecords) {
    return renderProblemWithServiceView(req, res);
  }

  const totalSelectableFeeRecords = parseInt(formValues.totalSelectableFeeRecords, 10);
  if (checkedCheckboxIds.length === totalSelectableFeeRecords) {
    return redirectWithError(req, res, reportId, paymentId, 'all-fee-records-selected');
  }

  return next();
};
