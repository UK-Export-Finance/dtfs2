type UnlinkPaymentFeesFormRequestBody = {
  totalSelectableFeeRecords?: string;
};

export const extractTotalSelectableFeeRecordsFromRequestBody = ({ totalSelectableFeeRecords }: UnlinkPaymentFeesFormRequestBody): number | undefined =>
  totalSelectableFeeRecords ? parseInt(totalSelectableFeeRecords, 10) : undefined;
