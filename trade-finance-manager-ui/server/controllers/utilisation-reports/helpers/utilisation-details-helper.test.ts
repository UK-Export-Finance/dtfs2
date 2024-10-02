import { CURRENCY, FeeRecordUtilisation } from '@ukef/dtfs2-common';
import { aFeeRecordUtilisation } from '../../../../test-helpers';
import { mapToUtilisationDetailsViewModel, mapToUtilisationTableRowViewModel } from './utilisation-details-helper';

describe('utilisation-details-helper', () => {
  describe('mapToUtilisationTableRowViewModel', () => {
    const aDataSortValues = () => ({ feesPayable: 1, feesAccrued: 2, facilityId: 3 });

    it('should format the fees accrued currency and amount to the currency followed by the amount', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        feesAccrued: { currency: CURRENCY.JPY, amount: 12345 },
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.feesAccrued.formattedCurrencyAndAmount).toEqual(`${CURRENCY.JPY} 12,345.00`);
    });

    it('should set the fees accrued data sort value to the given value', () => {
      // Arrange
      const dataSortValues = { ...aDataSortValues(), feesAccrued: 241 };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(aFeeRecordUtilisation(), dataSortValues);

      // Assert
      expect(utilisationTableRow.feesAccrued.dataSortValue).toEqual(dataSortValues.feesAccrued);
    });

    it('should format the fees payable currency and amount to the currency followed by the amount', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        feesPayable: { currency: CURRENCY.USD, amount: 325.56 },
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.feesPayable.formattedCurrencyAndAmount).toEqual(`${CURRENCY.USD} 325.56`);
    });

    it('should set the fees payable data sort value to the given value', () => {
      // Arrange
      const dataSortValues = { ...aDataSortValues(), feesPayable: 332 };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(aFeeRecordUtilisation(), dataSortValues);

      // Assert
      expect(utilisationTableRow.feesPayable.dataSortValue).toEqual(dataSortValues.feesPayable);
    });

    it('should map the fee record id', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        feeRecordId: 123,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.feeRecordId).toEqual(feeRecordUtilisation.feeRecordId);
    });

    it('should map the facilityId', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        facilityId: '123',
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.facilityId).toEqual(feeRecordUtilisation.facilityId);
    });

    it('should map the exporter', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        exporter: 'An exporter',
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.exporter).toEqual(feeRecordUtilisation.exporter);
    });

    it('should map the base currency', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        baseCurrency: CURRENCY.USD,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.baseCurrency).toEqual(feeRecordUtilisation.baseCurrency);
    });

    it('should format the value with thousands separators and decimal places', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        value: 456000,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.formattedValue).toEqual('456,000.00');
    });

    it('should format the utilisation with thousands separators and decimal places', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        utilisation: 123000,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.formattedUtilisation).toEqual('123,000.00');
    });

    it('should map the cover percentage', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        coverPercentage: 80,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.coverPercentage).toEqual(feeRecordUtilisation.coverPercentage);
    });

    it('should format the exposure with thousands separators and decimal places', () => {
      // Arrange
      const feeRecordUtilisation: FeeRecordUtilisation = {
        ...aFeeRecordUtilisation(),
        exposure: 80000,
      };

      // Act
      const utilisationTableRow = mapToUtilisationTableRowViewModel(feeRecordUtilisation, aDataSortValues());

      // Assert
      expect(utilisationTableRow.formattedExposure).toEqual('80,000.00');
    });
  });

  describe('mapToUtilisationDetailsViewModel', () => {
    it('maps each item to a utilisation table row', () => {
      // Arrange
      const items: FeeRecordUtilisation[] = [
        { ...aFeeRecordUtilisation(), feeRecordId: 1 },
        { ...aFeeRecordUtilisation(), feeRecordId: 2 },
      ];

      // Act
      const viewModel = mapToUtilisationDetailsViewModel(items);

      // Assert
      expect(viewModel.utilisationTableRows.length).toEqual(2);
      expect(viewModel.utilisationTableRows[0].feeRecordId).toEqual(1);
      expect(viewModel.utilisationTableRows[1].feeRecordId).toEqual(2);
    });

    it.only('sets the data sort values for fees accrued to be alphabetically by currency then numerically by amount', () => {
      // Arrange
      const items: FeeRecordUtilisation[] = [
        { ...aFeeRecordUtilisation(), feeRecordId: 1, feesAccrued: { currency: CURRENCY.EUR, amount: 300 } },
        { ...aFeeRecordUtilisation(), feeRecordId: 2, feesAccrued: { currency: CURRENCY.GBP, amount: 100 } },
        { ...aFeeRecordUtilisation(), feeRecordId: 3, feesAccrued: { currency: CURRENCY.EUR, amount: 200 } },
      ];

      // Act
      const viewModel = mapToUtilisationDetailsViewModel(items);

      // Assert
      expect(viewModel.utilisationTableRows.length).toEqual(3);
      expect(viewModel.utilisationTableRows[0].feesAccrued.dataSortValue).toEqual(1);
      expect(viewModel.utilisationTableRows[1].feesAccrued.dataSortValue).toEqual(2);
      expect(viewModel.utilisationTableRows[2].feesAccrued.dataSortValue).toEqual(0);
    });

    it('sets the data sort values for fees payable to be alphabetically by currency then numerically by amount', () => {
      // Arrange
      const items: FeeRecordUtilisation[] = [
        { ...aFeeRecordUtilisation(), feeRecordId: 1, feesPayable: { currency: CURRENCY.EUR, amount: 300 } },
        { ...aFeeRecordUtilisation(), feeRecordId: 2, feesPayable: { currency: CURRENCY.GBP, amount: 100 } },
        { ...aFeeRecordUtilisation(), feeRecordId: 3, feesPayable: { currency: CURRENCY.EUR, amount: 200 } },
      ];

      // Act
      const viewModel = mapToUtilisationDetailsViewModel(items);

      // Assert
      expect(viewModel.utilisationTableRows.length).toEqual(3);
      expect(viewModel.utilisationTableRows[0].feesPayable.dataSortValue).toEqual(1);
      expect(viewModel.utilisationTableRows[1].feesPayable.dataSortValue).toEqual(2);
      expect(viewModel.utilisationTableRows[2].feesPayable.dataSortValue).toEqual(0);
    });
  });
});
