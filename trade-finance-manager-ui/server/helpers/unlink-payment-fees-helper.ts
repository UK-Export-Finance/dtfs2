import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

export type UnlinkPaymentFeesFormRequestBody = Partial<Record<EditPaymentsTableCheckboxId, 'on'>> & {
  totalSelectableFeeRecords?: string;
};

export const extractTotalSelectableFeeRecordsFromRequestBody = ({ totalSelectableFeeRecords }: UnlinkPaymentFeesFormRequestBody): number | undefined =>
  totalSelectableFeeRecords ? parseInt(totalSelectableFeeRecords, 10) : undefined;
