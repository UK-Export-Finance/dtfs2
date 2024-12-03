import { Currency, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { asUserSession } from '../../helpers/express-session';
import {
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getFeeRecordStatusFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../helpers/premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../../types/premium-payments-table-checkbox-id';
import { getPremiumPaymentsFacilityIdQueryFromReferer } from '../../helpers/get-premium-payments-facility-id-query-from-referer';
import { AddPaymentErrorKey } from '../../types/premium-payments-tab-error-keys';
import { mapCheckedCheckboxesToRecord } from '../../helpers/map-checked-checkboxes-to-record';
import { ADD_PAYMENT_ERROR_KEY } from '../../constants/premium-payment-tab-error-keys';

/**
 * Checks if the given value is an object.
 * @param body - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

/**
 * Redirects the user to the utilisation report page with an error message.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param reportId - The ID of the utilisation report.
 * @param addPaymentError - The error key to be set in the session.
 * @param checkedCheckboxIds - An object representing the checked checkbox IDs.
 * @returns The redirect response.
 */
const redirectWithError = (
  req: Request,
  res: Response,
  reportId: string,
  addPaymentError: AddPaymentErrorKey,
  checkedCheckboxIds: Record<string, true | undefined> = {},
) => {
  req.session.addPaymentErrorKey = addPaymentError;
  req.session.checkedCheckboxIds = checkedCheckboxIds;
  const premiumPaymentsFacilityId = getPremiumPaymentsFacilityIdQueryFromReferer(req.headers.referer);
  return res.redirect(axios.getUri({ url: `/utilisation-reports/${reportId}`, params: { premiumPaymentsFacilityId } }));
};

/**
 * Checks if all selected fee records have the same currency.
 * @param checkedCheckboxIds - An array of premium payments table checkbox IDs.
 * @returns True if all selected fee records have the same currency, false otherwise.
 */
const allSelectedFeeRecordsHaveSameCurrency = (checkedCheckboxIds: PremiumPaymentsTableCheckboxId[]) => {
  const selectedPaymentCurrencies = new Set<Currency>();
  return checkedCheckboxIds.every((checkboxId) => {
    const currency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkboxId);
    selectedPaymentCurrencies.add(currency);
    return selectedPaymentCurrencies.size === 1;
  });
};

/**
 * Gets a set of unique fee record statuses from the selected checkbox IDs.
 * @param checkedCheckboxIds - An array of premium payments table checkbox IDs.
 * @returns A set of unique fee record statuses.
 */
const getSetOfSelectedFeeRecordStatuses = (checkedCheckboxIds: PremiumPaymentsTableCheckboxId[]): Set<FeeRecordStatus> => {
  const arrayOfStatuses = checkedCheckboxIds.map((checkboxId) => getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkboxId));
  return new Set(arrayOfStatuses);
};

/**
 * Checks if all statuses in the set are the same.
 * @param statuses - A set of fee record statuses.
 * @returns True if all statuses are the same, false otherwise.
 */
const allStatusesMatch = (statuses: Set<FeeRecordStatus>) => {
  return statuses.size === 1;
};

/**
 * Middleware to validate the request body for adding a payment.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @returns The next middleware function if validation passes, or a redirect/render response if validation fails.
 */
export const validatePostAddPaymentRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { user } = asUserSession(req.session);
  const { reportId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return res.render('_partials/problem-with-service.njk', { user });
  }

  const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(body);

  if (checkedCheckboxIds.length === 0) {
    return redirectWithError(req, res, reportId, ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED);
  }

  if (!allSelectedFeeRecordsHaveSameCurrency(checkedCheckboxIds)) {
    return redirectWithError(req, res, reportId, ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES, mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  const selectedFeeRecordStatuses = getSetOfSelectedFeeRecordStatuses(checkedCheckboxIds);
  if (!allStatusesMatch(selectedFeeRecordStatuses)) {
    return redirectWithError(req, res, reportId, ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES, mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  if (selectedFeeRecordStatuses.has(FEE_RECORD_STATUS.DOES_NOT_MATCH) && checkedCheckboxIds.length > 1) {
    return redirectWithError(req, res, reportId, ADD_PAYMENT_ERROR_KEY.MULTIPLE_DOES_NOT_MATCH_SELECTED, mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  return next();
};
