import { FeeRecordCorrectionRequestReviewResponseBody, FeeRecordCorrectionRequestReviewResponse } from '../../../api-response-types';

/**
 * validates that the type of responseBody is FeeRecordCorrectionRequestReviewResponseBody
 * if errorKey is present in responseBody, then is FeeRecordCorrectionRequestReviewErrorKey and returns false
 * returns true if errorKey is not present
 * @param responseBody - the getFeeRecordCorrectionRequestReview api call response
 * @returns true if errorKey is not present, false if errorKey is present
 */
export const isRecordCorrectionRequestReviewResponseType = (
  responseBody: FeeRecordCorrectionRequestReviewResponseBody,
): responseBody is FeeRecordCorrectionRequestReviewResponse => !('errorKey' in responseBody);
