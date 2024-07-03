import { ErrorSummaryViewModel } from '../../../types/view-models';

export type UnlinkPaymentFeesErrorKey = 'no-fee-records-selected' | 'all-fee-records-selected';

const unlinkPaymentFeesErrorMap: Record<UnlinkPaymentFeesErrorKey, [ErrorSummaryViewModel]> = {
  'no-fee-records-selected': [
    {
      text: 'Select fee or fees to remove from the payment',
      href: '#addedReportedFeesDetails',
    },
  ],
  'all-fee-records-selected': [
    {
      text: 'You cannot remove all the fees. Delete the payment instead.',
      href: '#addedReportedFeesDetails',
    },
  ],
};

export const getUnlinkPaymentFeesError = (unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey): [ErrorSummaryViewModel] =>
  unlinkPaymentFeesErrorMap[unlinkPaymentFeesErrorKey];
