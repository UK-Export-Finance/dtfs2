import { componentRenderer } from '../../../componentRenderer';
import { aPremiumPaymentsTableDefaultRendererParams, PremiumPaymentsTableComponentRendererParams } from './helpers';

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';
const tableSelector = '[data-cy="premium-payments-table"]';

const render = componentRenderer<PremiumPaymentsTableComponentRendererParams>(component);

describe(component, () => {
  const getWrapper = () => render(aPremiumPaymentsTableDefaultRendererParams());

  it('should render all table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(9);
    wrapper.expectText('[data-cy="premium-payments-table--facility-id-header"]').toRead('Facility ID');
    wrapper.expectText('[data-cy="premium-payments-table--exporter-header"]').toRead('Exporter');
    wrapper.expectText('[data-cy="premium-payments-table--reported-fees-header"]').toRead('Reported fees');
    wrapper.expectText('[data-cy="premium-payments-table--reported-payments-header"]').toRead('Reported payments');
    wrapper.expectText('[data-cy="premium-payments-table--total-reported-payments-header"]').toRead('Total reported payments');
    wrapper.expectText('[data-cy="premium-payments-table--payments-received-header"]').toRead('Payments received');
    wrapper.expectText('[data-cy="premium-payments-table--total-payments-received-header"]').toRead('Total payments received');
    wrapper.expectText('[data-cy="premium-payments-table--status-header"]').toRead('Status');
    wrapper.expectText('[data-cy="premium-payments-table--hidden-header"]').toRead('Facility ID and Exporter and Reported fees and Reported Payments');
  });

  it.each`
    columnName             | selector
    ${'Facility ID'}       | ${'[data-cy="premium-payments-table--facility-id-header"]'}
    ${'Exporter'}          | ${'[data-cy="premium-payments-table--exporter-header"]'}
    ${'Reported Fees'}     | ${'[data-cy="premium-payments-table--reported-fees-header"]'}
    ${'Reported payments'} | ${'[data-cy="premium-payments-table--reported-payments-header"]'}
  `("should set the '$columnName' column header to be aria-hidden", ({ selector }: { selector: string }) => {
    const wrapper = getWrapper();

    wrapper.expectElement(selector).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render the alternative fee record details header with visually hidden class', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="premium-payments-table--hidden-header"]').hasClass('govuk-visually-hidden');
  });

  it("should use the 'govuk-table__header--numeric' class for headers of numeric columns", () => {
    const wrapper = getWrapper();
    const numericHeaderClass = 'govuk-table__header--numeric';
    wrapper.expectElement('[data-cy="premium-payments-table--reported-fees-header"]').hasClass(numericHeaderClass);
    wrapper.expectElement('[data-cy="premium-payments-table--reported-payments-header"]').hasClass(numericHeaderClass);
    wrapper.expectElement('[data-cy="premium-payments-table--total-reported-payments-header"]').hasClass(numericHeaderClass);
    wrapper.expectElement('[data-cy="premium-payments-table--payments-received-header"]').hasClass(numericHeaderClass);
    wrapper.expectElement('[data-cy="premium-payments-table--total-payments-received-header"]').hasClass(numericHeaderClass);
  });

  it.each`
    columnName             | selector
    ${'Reported Fees'}     | ${'[data-cy="premium-payments-table--reported-fees-header"]'}
    ${'Reported payments'} | ${'[data-cy="premium-payments-table--reported-payments-header"]'}
    ${'Payments received'} | ${'[data-cy="premium-payments-table--payments-received-header"]'}
  `("should not make the '$columnName' column header sortable", ({ selector }: { selector: string }) => {
    const wrapper = getWrapper();

    wrapper.expectElement(selector).notToHaveAttribute('aria-sort');
  });

  it("should set the 'Total reported payments' column to sortable with 'aria-sort' set to 'ascending'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="premium-payments-table--total-reported-payments-header"]').toHaveAttribute('aria-sort', 'ascending');
  });

  it("should set the 'Status' column to sortable with 'aria-sort' set to 'none'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="premium-payments-table--status-header"]').toHaveAttribute('aria-sort', 'none');
  });

  it("should set the 'Total payments received' column header to sortable if 'enablePaymentsReceivedSorting' is set to true", () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), enablePaymentsReceivedSorting: true });

    wrapper.expectElement('[data-cy="premium-payments-table--total-payments-received-header"]').toHaveAttribute('aria-sort', 'none');
  });

  it("should not set the total payments received column header to sortable if 'enablePaymentsReceivedSorting' is set to false", () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), enablePaymentsReceivedSorting: false });

    wrapper.expectElement('[data-cy="premium-payments-table--total-payments-received-header"]').notToHaveAttribute('aria-sort');
  });

  it('should render the select all checkbox in the table headings row when userCanEdit is true and hasSelectableRows is true', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, hasSelectableRows: true });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).toExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is false and hasSelectableRows is true', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: false, hasSelectableRows: true });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is true and hasSelectableRows is false', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, hasSelectableRows: false });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is false and hasSelectableRows is false', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: false, hasSelectableRows: false });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });
});
