import { CURRENCY, Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { NextFunction, Request, Response } from 'express';
import { asUserSession } from '../../helpers/express-session';
import { AddPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';

const CURRENCY_REGEX_GROUP = `(?<currency>${Object.values(CURRENCY).join('|')})`;
const CURRENCY_REGEX = new RegExp(CURRENCY_REGEX_GROUP);

const FEE_RECORD_STATUS_REGEX_GROUP = `(?<status>${Object.values(FEE_RECORD_STATUS).join('|')})`;
const FEE_RECORD_STATUS_REGEX = new RegExp(FEE_RECORD_STATUS_REGEX_GROUP);

const FEE_RECORD_CHECKBOX_KEY_REGEX = new RegExp(`feeRecordId-\\d+-reportedPaymentsCurrency-${CURRENCY_REGEX_GROUP}-status-${FEE_RECORD_STATUS_REGEX_GROUP}`);

const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const redirectWithError = (
  req: Request,
  res: Response,
  reportId: string,
  addPaymentError: AddPaymentErrorKey,
  checkedCheckboxIds: Record<string, true | undefined> = {},
) => {
  req.session.addPaymentErrorKey = addPaymentError;
  req.session.checkedCheckboxIds = checkedCheckboxIds;
  return res.redirect(`/utilisation-reports/${reportId}`);
};

export const validatePostAddPaymentRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { user } = asUserSession(req.session);
  const { reportId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return res.render('_partials/problem-with-service.njk', { user });
  }

  const feeRecordCheckboxIds = Object.keys(body).filter((key) => FEE_RECORD_CHECKBOX_KEY_REGEX.test(key));

  if (feeRecordCheckboxIds.length === 0) {
    return redirectWithError(req, res, reportId, 'no-fee-records-selected');
  }

  const checkedCheckboxIds = feeRecordCheckboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: true }), {});

  const selectedPaymentCurrencies = new Set<Currency>();
  const selectedFeeRecordsHaveSamePaymentCurrency = feeRecordCheckboxIds.every((checkboxId) => {
    const { currency } = checkboxId.match(CURRENCY_REGEX)!.groups!;
    selectedPaymentCurrencies.add(currency as Currency);
    return selectedPaymentCurrencies.size === 1;
  });

  if (!selectedFeeRecordsHaveSamePaymentCurrency) {
    return redirectWithError(req, res, reportId, 'different-fee-record-payment-currencies', checkedCheckboxIds);
  }

  const selectedFeeRecordStatuses = new Set<FeeRecordStatus>();
  const selectedFeeRecordsHaveSameStatus = feeRecordCheckboxIds.every((checkboxId) => {
    const { status } = checkboxId.match(FEE_RECORD_STATUS_REGEX)!.groups!;
    selectedFeeRecordStatuses.add(status as FeeRecordStatus);
    return selectedFeeRecordStatuses.size === 1;
  });

  if (!selectedFeeRecordsHaveSameStatus) {
    return redirectWithError(req, res, reportId, 'different-fee-record-statuses', checkedCheckboxIds);
  }

  if (selectedFeeRecordStatuses.has('DOES_NOT_MATCH') && feeRecordCheckboxIds.length > 1) {
    return redirectWithError(req, res, reportId, 'multiple-does-not-match-selected', checkedCheckboxIds);
  }

  return next();
};
