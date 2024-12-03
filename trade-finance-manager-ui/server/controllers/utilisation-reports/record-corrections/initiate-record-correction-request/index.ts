import { CustomExpressRequest, FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import axios from 'axios';
import { PremiumPaymentsTableCheckboxSelectionsRequestBody } from '../../helpers';
import {
  getFeeRecordIdsFromPremiumPaymentsCheckboxIds,
  getFeeRecordStatusFromPremiumPaymentsCheckboxId,
  getPremiumPaymentsCheckboxIdsFromObjectKeys,
} from '../../../../helpers/premium-payments-table-checkbox-id-helper';
import { getPremiumPaymentsFacilityIdQueryFromReferer } from '../../../../helpers/get-premium-payments-facility-id-query-from-referer';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { mapCheckedCheckboxesToRecord } from '../../../../helpers/map-checked-checkboxes-to-record';
import { InitiateRecordCorrectionRequestErrorKey } from '../../../../types/premium-payments-tab-error-keys';
import { PremiumPaymentsTableCheckboxId } from '../../../../types/premium-payments-table-checkbox-id';

export type PostInitiateRecordCorrectionRequest = CustomExpressRequest<{
  reqBody: PremiumPaymentsTableCheckboxSelectionsRequestBody;
}>;

type ValidationResult =
  | {
      errorKey: InitiateRecordCorrectionRequestErrorKey;
      selectedFeeRecordId: null;
    }
  | {
      errorKey: null;
      selectedFeeRecordId: number;
    };

/**
 * Parses and validates fee selections for initiating a create record correction request journey
 * @param checkedCheckboxIds - The checked checkbox ids
 * @returns an object containing an error key for redirecting to premium payments tab if the
 * fee selections are not valid, or an object containing the selected fee record id if the fee
 * selections are valid.
 */
export const validateRecordCorrectionRequestFeeSelections = (checkedCheckboxIds: PremiumPaymentsTableCheckboxId[]): ValidationResult => {
  if (checkedCheckboxIds.length === 0) {
    return { errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED, selectedFeeRecordId: null };
  }

  if (checkedCheckboxIds.length > 1) {
    return { errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED, selectedFeeRecordId: null };
  }

  const checkedCheckboxId = checkedCheckboxIds[0];
  const selectedCheckboxStatus = getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkedCheckboxId);

  if (selectedCheckboxStatus !== FEE_RECORD_STATUS.TO_DO) {
    return { errorKey: INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS, selectedFeeRecordId: null };
  }

  const selectedFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkedCheckboxId]);

  if (selectedFeeRecordIds.length !== 1) {
    throw new Error(`Invalid premium payments checkbox id encountered for fee record at ${FEE_RECORD_STATUS.TO_DO} status ${checkedCheckboxId}`);
  }

  return { selectedFeeRecordId: selectedFeeRecordIds[0], errorKey: null };
};

/**
 * Controller for the POST initiate record correction request route.
 *
 * Validates selected fee records for creating a record correction request.
 *
 * Redirects to the premium payments tab with the appropriate error message
 * if the selections are not valid for record correction request creation.
 *
 * Redirects to the create record correction request page for the selected
 * fee record if the selections are valid for record correction request creation.
 *
 * @param req - The request object
 * @param res - The response object
 */
export const postInitiateRecordCorrectionRequest = (req: PostInitiateRecordCorrectionRequest, res: Response) => {
  try {
    const { reportId } = req.params;

    const checkedCheckboxIds = getPremiumPaymentsCheckboxIdsFromObjectKeys(req.body);

    const { errorKey, selectedFeeRecordId } = validateRecordCorrectionRequestFeeSelections(checkedCheckboxIds);

    if (errorKey) {
      req.session.initiateRecordCorrectionRequestErrorKey = errorKey;
      req.session.checkedCheckboxIds = mapCheckedCheckboxesToRecord(checkedCheckboxIds);

      const premiumPaymentsFacilityId = getPremiumPaymentsFacilityIdQueryFromReferer(req.headers.referer);
      return res.redirect(axios.getUri({ url: `/utilisation-reports/${reportId}`, params: { premiumPaymentsFacilityId } }));
    }

    return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${selectedFeeRecordId}`);
  } catch (error) {
    console.error('Failed to initiate record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
