import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

export type RemoveFeesFromPaymentGroupFormRequestBody = Partial<Record<EditPaymentsTableCheckboxId, 'on'>> & {
  totalSelectableFeeRecords?: string;
};

export const extractTotalSelectableFeeRecordsFromRequestBody = ({
  totalSelectableFeeRecords,
}: RemoveFeesFromPaymentGroupFormRequestBody): number | undefined => (totalSelectableFeeRecords ? parseInt(totalSelectableFeeRecords, 10) : undefined);
