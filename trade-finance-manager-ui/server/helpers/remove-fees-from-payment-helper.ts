import { EditPaymentFormRequestBody } from '../controllers/utilisation-reports/helpers';
import { EditPaymentsTableCheckboxId } from '../types/edit-payments-table-checkbox-id';

export type RemoveFeesFromPaymentFormRequestBody = EditPaymentFormRequestBody &
  Partial<Record<EditPaymentsTableCheckboxId, 'on'>> & {
    totalSelectableFeeRecords?: string;
  };

export const extractTotalSelectableFeeRecordsFromRequestBody = ({ totalSelectableFeeRecords }: RemoveFeesFromPaymentFormRequestBody): number | undefined =>
  totalSelectableFeeRecords ? parseInt(totalSelectableFeeRecords, 10) : undefined;
