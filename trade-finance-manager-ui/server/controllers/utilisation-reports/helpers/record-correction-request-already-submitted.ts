import { STATUS } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestReviewResponseBody } from '../../../api-response-types';

/**
 * if record correction request is already submitted,
 * then responseBody will contain errorKey set to STATUS.INVALID
 * returns true if so, false if not
 * @param responseBody - the getFeeRecordCorrectionRequestReview api call response
 * @returns true if errorKey is set to STATUS.INVALID, false if not present or not set
 */
export const recordCorrectionRequestAlreadySubmitted = (responseBody: FeeRecordCorrectionRequestReviewResponseBody) =>
  'errorKey' in responseBody && responseBody?.errorKey === STATUS.INVALID;
