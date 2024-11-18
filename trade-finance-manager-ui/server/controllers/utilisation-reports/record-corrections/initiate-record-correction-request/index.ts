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
import { InitiateRecordCorrectionRequestErrorKey } from '../../../../types/premium-payments-tab-error-keys';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { mapCheckedCheckboxesToRecord } from '../../../../helpers/map-checked-checkboxes-to-record';

export type PostInitiateRecordCorrectionRequest = CustomExpressRequest<{
  reqBody: PremiumPaymentsTableCheckboxSelectionsRequestBody;
}>;

/**
 * Redirects the user to the premium payments page with an error message.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param reportId - The ID of the utilisation report.
 * @param initiateRecordCorrectionRequestError - The error key to be set in the session.
 * @param checkedCheckboxIds - An object representing the checked checkbox IDs.
 * @returns The redirect response.
 */
const redirectToPremiumPaymentsWithError = (
  req: PostInitiateRecordCorrectionRequest,
  res: Response,
  reportId: string,
  initiateRecordCorrectionRequestError: InitiateRecordCorrectionRequestErrorKey,
  checkedCheckboxIds: Record<string, true | undefined> = {},
) => {
  req.session.initiateRecordCorrectionRequestErrorKey = initiateRecordCorrectionRequestError;
  req.session.checkedCheckboxIds = checkedCheckboxIds;

  const premiumPaymentsFacilityId = getPremiumPaymentsFacilityIdQueryFromReferer(req.headers.referer);
  return res.redirect(axios.getUri({ url: `/utilisation-reports/${reportId}`, params: { premiumPaymentsFacilityId } }));
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

    if (checkedCheckboxIds.length === 0) {
      return redirectToPremiumPaymentsWithError(
        req,
        res,
        reportId,
        INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED,
        mapCheckedCheckboxesToRecord(checkedCheckboxIds),
      );
    }

    if (checkedCheckboxIds.length > 1) {
      return redirectToPremiumPaymentsWithError(
        req,
        res,
        reportId,
        INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED,
        mapCheckedCheckboxesToRecord(checkedCheckboxIds),
      );
    }

    const checkedCheckboxId = checkedCheckboxIds[0];
    const selectedCheckboxStatus = getFeeRecordStatusFromPremiumPaymentsCheckboxId(checkedCheckboxId);

    if (selectedCheckboxStatus !== FEE_RECORD_STATUS.TO_DO) {
      return redirectToPremiumPaymentsWithError(
        req,
        res,
        reportId,
        INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS,
        mapCheckedCheckboxesToRecord(checkedCheckboxIds),
      );
    }

    const selectedFeeRecordIds = getFeeRecordIdsFromPremiumPaymentsCheckboxIds([checkedCheckboxId]);

    if (selectedFeeRecordIds.length !== 1) {
      throw new Error(`Invalid premium payments checkbox id encountered for fee record at ${FEE_RECORD_STATUS.TO_DO} status ${checkedCheckboxId}`);
    }

    const selectedFeeRecordId = selectedFeeRecordIds[0];

    return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${selectedFeeRecordId}`);
  } catch (error) {
    console.error('Failed to initiate record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
