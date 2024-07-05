import { Currency, FeeRecordStatus } from '@ukef/dtfs2-common';
import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { asUserSession } from '../../helpers/express-session';
import { AddPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';
import {
  getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId,
  getFeeRecordStatusFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../helpers/premium-payments-table-checkbox-id-helper';
import { PremiumPaymentsTableCheckboxId } from '../../types/premium-payments-table-checkbox-id';
import { mapCheckedCheckboxesToRecord } from '../../helpers/checkbox-helpers';

const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const FACILITY_ID_QUERY_REGEX = /facilityIdQuery=(?<facilityIdQuery>\d{4,10})/;

const getFacilityIdQueryFromReferer = (req: Request): string | undefined => {
  const { referer } = req.headers;
  if (!referer) {
    return undefined;
  }

  const captureGroups = FACILITY_ID_QUERY_REGEX.exec(referer)?.groups;
  if (!captureGroups) {
    return undefined;
  }
  return captureGroups.facilityIdQuery;
};

const redirectWithError = (
  req: Request,
  res: Response,
  reportId: string,
  addPaymentError: AddPaymentErrorKey,
  checkedCheckboxIds: Record<string, true | undefined> = {},
) => {
  req.session.addPaymentErrorKey = addPaymentError;
  req.session.checkedCheckboxIds = checkedCheckboxIds;
  const facilityIdQuery = getFacilityIdQueryFromReferer(req);
  return res.redirect(axios.getUri({ url: `/utilisation-reports/${reportId}`, params: { facilityIdQuery } }));
};

const allSelectedFeeRecordsHaveSameCurrency = (checkedCheckboxIds: PremiumPaymentsTableCheckboxId[]) => {
  const selectedPaymentCurrencies = new Set<Currency>();
  return checkedCheckboxIds.every((checkboxId) => {
    const currency = getFeeRecordPaymentCurrencyFromPremiumPaymentsCheckboxId(checkboxId);
    selectedPaymentCurrencies.add(currency);
    return selectedPaymentCurrencies.size === 1;
  });
};

const getSetOfSelectedFeeRecordStatuses = (checkedCheckboxIds: PremiumPaymentsTableCheckboxId[]): Set<FeeRecordStatus> => {
  const arrayOfStatuses = checkedCheckboxIds.map((checkboxId) => getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkboxId));
  return new Set(arrayOfStatuses);
};

const allStatusesMatch = (statuses: Set<FeeRecordStatus>) => {
  return statuses.size === 1;
};

export const validatePostAddPaymentRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { user } = asUserSession(req.session);
  const { reportId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return res.render('_partials/problem-with-service.njk', { user });
  }

  const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(body);

  if (checkedCheckboxIds.length === 0) {
    return redirectWithError(req, res, reportId, 'no-fee-records-selected');
  }

  if (!allSelectedFeeRecordsHaveSameCurrency(checkedCheckboxIds)) {
    return redirectWithError(req, res, reportId, 'different-fee-record-payment-currencies', mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  const selectedFeeRecordStatuses = getSetOfSelectedFeeRecordStatuses(checkedCheckboxIds);
  if (!allStatusesMatch(selectedFeeRecordStatuses)) {
    return redirectWithError(req, res, reportId, 'different-fee-record-statuses', mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  if (selectedFeeRecordStatuses.has('DOES_NOT_MATCH') && checkedCheckboxIds.length > 1) {
    return redirectWithError(req, res, reportId, 'multiple-does-not-match-selected', mapCheckedCheckboxesToRecord(checkedCheckboxIds));
  }

  return next();
};
