import { FeeRecordUtilisation, getFormattedCurrencyAndAmount, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { UtilisationDetailsViewModel, UtilisationTableRowViewModel } from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';

type UtilisationTableRowDataSortValues = { feesPayable: number; feesAccrued: number };

export const mapToUtilisationTableRowViewModel = (
  feeRecordUtilisation: FeeRecordUtilisation,
  dataSortValues: UtilisationTableRowDataSortValues,
): UtilisationTableRowViewModel => ({
  feeRecordId: feeRecordUtilisation.feeRecordId,
  facilityId: feeRecordUtilisation.facilityId,
  exporter: feeRecordUtilisation.exporter,
  baseCurrency: feeRecordUtilisation.baseCurrency,
  formattedValue: getFormattedMonetaryValue(feeRecordUtilisation.value),
  formattedUtilisation: getFormattedMonetaryValue(feeRecordUtilisation.utilisation),
  coverPercentage: feeRecordUtilisation.coverPercentage,
  formattedExposure: getFormattedMonetaryValue(feeRecordUtilisation.exposure),
  feesAccrued: {
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecordUtilisation.feesAccrued),
    dataSortValue: dataSortValues.feesAccrued,
  },
  feesPayable: {
    formattedCurrencyAndAmount: getFormattedCurrencyAndAmount(feeRecordUtilisation.feesPayable),
    dataSortValue: dataSortValues.feesPayable,
  },
});

export const mapToUtilisationDetailsViewModel = (utilisationDetails: FeeRecordUtilisation[], reportId: string): UtilisationDetailsViewModel => {
  const feesPayableDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    utilisationDetails.map(({ feeRecordId, feesPayable }) => ({ ...feesPayable, key: feeRecordId })),
  );
  const feesAccruedDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    utilisationDetails.map(({ feeRecordId, feesAccrued }) => ({ ...feesAccrued, key: feeRecordId })),
  );

  return {
    downloadUrl: `/utilisation-reports/${reportId}/download`,
    utilisationTableRows: utilisationDetails.map((feeRecordUtilisation) => {
      const { feeRecordId } = feeRecordUtilisation;
      const dataSortValues: UtilisationTableRowDataSortValues = {
        feesAccrued: feesAccruedDataSortValueMap[feeRecordId],
        feesPayable: feesPayableDataSortValueMap[feeRecordId],
      };
      return mapToUtilisationTableRowViewModel(feeRecordUtilisation, dataSortValues);
    }),
  };
};
