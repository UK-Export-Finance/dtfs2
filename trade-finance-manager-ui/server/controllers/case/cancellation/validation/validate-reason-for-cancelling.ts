import { ErrorSummaryViewModel, ReasonForCancellingErrorsViewModel } from '../../../../types/view-models';

const MAXIMUM_LENGTH = 1200;
const REASON_TOO_LONG_MESSAGE = `Reason for cancelling must be ${MAXIMUM_LENGTH} characters or less`;

/**
 * @param reason The reason for cancelling
 * @returns a reason for cancelling errors view model
 */
export const validateReasonForCancelling = (reason: string | undefined): ReasonForCancellingErrorsViewModel => {
  const errorSummary: ErrorSummaryViewModel[] = [];

  const reasonForCancellingErrorMessage = reason && reason.length > MAXIMUM_LENGTH ? REASON_TOO_LONG_MESSAGE : undefined;
  if (reasonForCancellingErrorMessage) {
    errorSummary.push({ text: reasonForCancellingErrorMessage, href: 'reason-for-cancelling' });
  }

  return { errorSummary, reasonForCancellingErrorMessage };
};
