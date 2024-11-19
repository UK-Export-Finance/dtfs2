import { aPremiumPaymentsViewModelItem } from '../../../../test-helpers';
import { PremiumPaymentsViewModelItem } from '../../../../server/types/view-models';

export type PremiumPaymentsTableComponentRendererParams = {
  reportId: number;
  userCanEdit: boolean;
  feeRecordPaymentGroups: PremiumPaymentsViewModelItem[];
  enablePaymentsReceivedSorting: boolean;
  hasSelectableRows: boolean;
};

export const aPremiumPaymentsTableDefaultRendererParams = (): PremiumPaymentsTableComponentRendererParams => ({
  userCanEdit: true,
  reportId: 1,
  feeRecordPaymentGroups: [aPremiumPaymentsViewModelItem()],
  enablePaymentsReceivedSorting: true,
  hasSelectableRows: true,
});
