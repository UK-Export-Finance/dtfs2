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

  const nthTableHeaderSelector = (n: number) => `thead th:nth-child(${n})`;

  it('should render all table headings', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('table thead tr').toHaveCount(1);
    wrapper.expectElement('table thead th').toHaveCount(9);
    wrapper.expectText(nthTableHeaderSelector(1)).toRead('Facility ID');
    wrapper.expectText(nthTableHeaderSelector(2)).toRead('Exporter');
    wrapper.expectText(nthTableHeaderSelector(3)).toRead('Base currency');
    wrapper.expectText(nthTableHeaderSelector(4)).toRead('Value');
    wrapper.expectText(nthTableHeaderSelector(5)).toRead('Utilisation');
    wrapper.expectText(nthTableHeaderSelector(6)).toRead('UKEF cover');
    wrapper.expectText(nthTableHeaderSelector(7)).toRead('UKEF exposure');
    wrapper.expectText(nthTableHeaderSelector(8)).toRead('Fees accrued');
    wrapper.expectText(nthTableHeaderSelector(9)).toRead('Fees payable to UKEF (reported currency)');
  });

  it('should set all columns as sortable with the default sort order as the first column ascending', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectAriaSort(nthTableHeaderSelector(1)).toEqual('ascending');
    wrapper.expectAriaSort(nthTableHeaderSelector(2)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(3)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(4)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(5)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(6)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(7)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(8)).toEqual('none');
    wrapper.expectAriaSort(nthTableHeaderSelector(9)).toEqual('none');
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

    const tableRowSelector = `tbody tr[data-cy="utilisation-table-row-${feeRecordId}"]`;

    // Assert
    wrapper.expectText(`${tableRowSelector} th`).toRead(row.facilityId);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(1)`).toRead(row.exporter);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(2)`).toRead(row.baseCurrency);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(3)`).toRead(row.formattedValue);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(4)`).toRead(row.formattedUtilisation);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(5)`).toRead(`${row.coverPercentage}%`);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(6)`).toRead(row.formattedExposure);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(7)`).toRead(row.feesAccrued.formattedCurrencyAndAmount);
    wrapper.expectText(`${tableRowSelector} td:nth-of-type(8)`).toRead(row.feesPayable.formattedCurrencyAndAmount);
  });
});
