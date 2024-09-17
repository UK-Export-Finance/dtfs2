import { MAX_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel, ReasonForCancellingErrorsViewModel } from '../../../../types/view-models';

const REASON_TOO_LONG_MESSAGE = `Reason for cancelling must be ${MAX_CHARACTER_COUNT} characters or less`;

/**
 * @param reason The reason for cancelling
 * @returns a reason for cancelling errors view model
 */
export const validateReasonForCancelling = (reason: string): ReasonForCancellingErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const reasonForCancellingErrorMessage = reason.length > MAX_CHARACTER_COUNT ? REASON_TOO_LONG_MESSAGE : undefined;
  if (reasonForCancellingErrorMessage) {
    errorSummary.push({ text: reasonForCancellingErrorMessage, href: 'reason-for-cancelling' });
  }

  return { errorSummary, reasonForCancellingErrorMessage };
};
