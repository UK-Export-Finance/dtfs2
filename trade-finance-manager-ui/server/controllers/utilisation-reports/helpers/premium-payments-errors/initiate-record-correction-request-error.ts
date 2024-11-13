import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-href';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { InitiateRecordCorrectionRequestErrorKey } from '../../../../types/premium-payments-tab-error-keys';
import { ErrorSummaryViewModel } from '../../../../types/view-models';

const { MULTIPLE_FEE_RECORDS_SELECTED, NO_FEE_RECORDS_SELECTED, INVALID_STATUS } = INITIATE_RECORD_CORRECTION_ERROR_KEY;

const initiateRecordCorrectionRequestErrorMap: Record<InitiateRecordCorrectionRequestErrorKey, ErrorSummaryViewModel> = {
  [MULTIPLE_FEE_RECORDS_SELECTED]: {
    text: 'Select one fee for a fee record correction request',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
  [NO_FEE_RECORDS_SELECTED]: {
    text: 'Select a record to create a record correction request',
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
  [INVALID_STATUS]: {
    text: "Select a fee in 'To do' status to create a record correction request",
    href: PREMIUM_PAYMENTS_TABLE_ERROR_HREF,
  },
};

/**
 * Gets initiate record correction request error
 * @param initiateRecordCorrectionRequestErrorKey - initiate record correction request error key
 * @returns error summary for given key
 */
export const getInitiateRecordCorrectionRequestError = (
  initiateRecordCorrectionRequestErrorKey: InitiateRecordCorrectionRequestErrorKey,
): ErrorSummaryViewModel => initiateRecordCorrectionRequestErrorMap[initiateRecordCorrectionRequestErrorKey];

/**
 * Validates initiate record correction request error key
 * @param initiateRecordCorrectionRequestErrorKey - initiate record correction request error key
 * @returns true if key is valid
 * @throws {Error} if the key is not valid
 */
export const validateInitiateRecordCorrectionErrorKey = (
  initiateRecordCorrectionRequestErrorKey: string,
): initiateRecordCorrectionRequestErrorKey is InitiateRecordCorrectionRequestErrorKey => {
  const allKeys: string[] = Object.values(INITIATE_RECORD_CORRECTION_ERROR_KEY);
  if (allKeys.includes(initiateRecordCorrectionRequestErrorKey)) {
    return true;
  }

  throw new Error(`Unrecognised initiate record correction request error key '${initiateRecordCorrectionRequestErrorKey}'`);
};
