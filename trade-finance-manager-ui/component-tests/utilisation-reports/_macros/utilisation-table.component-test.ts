import { CURRENCY } from '@ukef/dtfs2-common';
import { aUtilisationTableRowViewModel } from '../../../test-helpers';
import { UtilisationTableRowViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/utilisation-table.njk';
const render = componentRenderer(component, false);

type UtilisationTableViewModel = {
  utilisationTableRows: UtilisationTableRowViewModel[];
};

describe(component, () => {
  const aUtilisationTableViewModel = (): UtilisationTableViewModel => ({
    utilisationTableRows: [aUtilisationTableRowViewModel()],
  });

  const getWrapper = (viewModel: UtilisationTableViewModel = aUtilisationTableViewModel()) => render(viewModel);

  it('should render all table headings', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('table thead tr').toHaveCount(1);
    wrapper.expectElement('table thead th').toHaveCount(9);
    wrapper.expectText('th[data-cy="facility-id-header"]').toRead('Facility ID');
    wrapper.expectText('th[data-cy="exporter-header"]').toRead('Exporter');
    wrapper.expectText('th[data-cy="base-currency-header"]').toRead('Base currency');
    wrapper.expectText('th[data-cy="value-header"]').toRead('Facility value');
    wrapper.expectText('th[data-cy="utilisation-header"]').toRead('Bank utilisation');
    wrapper.expectText('th[data-cy="cover-percentage-header"]').toRead('UKEF cover');
    wrapper.expectText('th[data-cy="exposure-header"]').toRead('UKEF exposure');
    wrapper.expectText('th[data-cy="fees-accrued-header"]').toRead('Fees accrued for the period');
    wrapper.expectText('th[data-cy="fees-payable-header"]').toRead('Fees payable to UKEF for the period (reported currency)');
  });

  it('should set all columns as sortable with the default sort order as the facility id column ascending', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectAriaSort('th[data-cy="facility-id-header"]').toEqual('ascending');
    wrapper.expectAriaSort('th[data-cy="exporter-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="base-currency-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="value-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="utilisation-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="cover-percentage-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="exposure-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="fees-accrued-header"]').toEqual('none');
    wrapper.expectAriaSort('th[data-cy="fees-payable-header"]').toEqual('none');
  });

  it('should render one row per passed in item', () => {
    // Arrange
    const wrapper = getWrapper({ utilisationTableRows: [aUtilisationTableRowViewModel(), aUtilisationTableRowViewModel()] });

    // Assert
    wrapper.expectElement('table tbody tr').toHaveCount(2);
  });

  it('should display the row contents', () => {
    // Arrange
    const feeRecordId = 123;
    const row: UtilisationTableRowViewModel = {
      feeRecordId,
      facilityId: '01234567',
      exporter: 'Fish exporter',
      baseCurrency: CURRENCY.GBP,
      formattedValue: '2,000.00',
      formattedUtilisation: '3,000.00',
      coverPercentage: 80,
      formattedExposure: '567.12',
      feesAccrued: { formattedCurrencyAndAmount: 'GBP 200.00', dataSortValue: 1 },
      feesPayable: { formattedCurrencyAndAmount: 'USD 300.00', dataSortValue: 2 },
    };

    const wrapper = getWrapper({
      utilisationTableRows: [row],
    });

    // Assert
    wrapper.expectText('td[data-cy="facility-id"]').toRead(row.facilityId);
    wrapper.expectText('td[data-cy="exporter"]').toRead(row.exporter);
    wrapper.expectText('td[data-cy="base-currency"]').toRead(row.baseCurrency);
    wrapper.expectText('td[data-cy="value"]').toRead(row.formattedValue);
    wrapper.expectText('td[data-cy="utilisation"]').toRead(row.formattedUtilisation);
    wrapper.expectText('td[data-cy="cover-percentage"]').toRead(`${row.coverPercentage}%`);
    wrapper.expectText('td[data-cy="exposure"]').toRead(row.formattedExposure);
    wrapper.expectText('td[data-cy="fees-accrued"]').toRead(row.feesAccrued.formattedCurrencyAndAmount);
    wrapper.expectText('td[data-cy="fees-payable"]').toRead(row.feesPayable.formattedCurrencyAndAmount);
  });
});
