import { getFormattedCurrencyAndAmount } from '@ukef/dtfs2-common';
import { SelectedReportedFeesDetailsViewModel } from '@tfm-ui/types/view-models';
import { SelectedFeeRecordsDetailsResponseBody } from '@tfm-ui/api-response-types';
import { getKeyToCurrencyAndAmountSortValueMap } from '.';

export const mapToSelectedReportedFeesDetailsViewModel = (
  selectedFeeRecordData: SelectedFeeRecordsDetailsResponseBody,
): SelectedReportedFeesDetailsViewModel => {
  const reportedFeeDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    selectedFeeRecordData.feeRecords.map((record) => ({ ...record.reportedFee, key: record.id })),
  );
  const reportedPaymentsDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    selectedFeeRecordData.feeRecords.map((record) => ({ ...record.reportedPayments, key: record.id })),
  );

  return {
    totalReportedPayments: getFormattedCurrencyAndAmount(selectedFeeRecordData.totalReportedPayments),
    feeRecords: selectedFeeRecordData.feeRecords.map((record) => ({
      id: record.id,
      facilityId: record.facilityId,
      exporter: record.exporter,
      reportedFees: { formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(record.reportedFee), dataSortValue: reportedFeeDataSortValueMap[record.id] },
      reportedPayments: {
        formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(record.reportedPayments),
        dataSortValue: reportedPaymentsDataSortValueMap[record.id],
      },
    })),
  };
};
