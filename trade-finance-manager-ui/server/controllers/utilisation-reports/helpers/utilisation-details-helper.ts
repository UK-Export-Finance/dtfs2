import { FeeRecordUtilisation, getFormattedCurrencyAndAmount, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { UtilisationDetailsViewModel, UtilisationTableRowViewModel } from '../../../types/view-models';
import { getKeyToCurrencyAndAmountSortValueMap } from './get-key-to-currency-and-amount-sort-value-map-helper';

type UtilisationTableRowDataSortValues = { feesPayable: number; feesAccrued: number };

/**
 * Maps a fee record utilisation object and the data sort values
 * for the fields used in columns with custom sorting defined
 * to the view model for a row in the utilisation table
 * @param feeRecordUtilisation - the fee record utilisation
 * @param dataSortValues - the data sort values
 * @returns the view model for the row in the utilisation table
 */
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

/**
 * Map the utilisation details to the utilisation details view model
 * @param utilisationDetails - the utilisation details
 * @returns the utilisation details view model
 */
export const mapToUtilisationDetailsViewModel = (utilisationDetails: FeeRecordUtilisation[]): UtilisationDetailsViewModel => {
  const feesPayableDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    utilisationDetails.map(({ feeRecordId, feesPayable }) => ({ ...feesPayable, key: feeRecordId })),
  );
  const feesAccruedDataSortValueMap = getKeyToCurrencyAndAmountSortValueMap(
    utilisationDetails.map(({ feeRecordId, feesAccrued }) => ({ ...feesAccrued, key: feeRecordId })),
  );

  const mappedRows = utilisationDetails.map((feeRecordUtilisation) => {
    const { feeRecordId } = feeRecordUtilisation;
    const dataSortValues: UtilisationTableRowDataSortValues = {
      feesAccrued: feesAccruedDataSortValueMap[feeRecordId],
      feesPayable: feesPayableDataSortValueMap[feeRecordId],
    };
    return mapToUtilisationTableRowViewModel(feeRecordUtilisation, dataSortValues);
  });

  return {
    utilisationTableRows: mappedRows,
  };
};
