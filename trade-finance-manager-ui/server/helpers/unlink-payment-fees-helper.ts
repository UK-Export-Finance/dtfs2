type UnlinkPaymentFeesFormRequestBody = {
  totalSelectableFeeRecords?: string;
};

type UnlinkPaymentFeesFormValues = {
  totalSelectableFeeRecords?: string;
};

export const extractTotalSelectableFeeRecordsFromRequestBody = (requestBody: UnlinkPaymentFeesFormRequestBody): UnlinkPaymentFeesFormValues => {
  return {
    totalSelectableFeeRecords: requestBody.totalSelectableFeeRecords,
  };
};
