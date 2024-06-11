const difference = require('lodash/difference');
const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');
const { aFeeRecordViewModelItem } = require('../../../test-helpers');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';
const tableSelector = '[data-cy="premium-payments-table"]';

const render = componentRenderer(component);

describe(component, () => {
  /**
   * @type {import('../../../server/types/view-models').FeeRecordViewModelItem[]}
   */
  const feeRecords = [
    {
      ...aFeeRecordViewModelItem(),
      id: 1,
      facilityId: '12345678',
      exporter: 'Test exporter',
      paymentsReceived: {
        formattedCurrencyAndAmount: undefined,
        dataSortValue: 0,
      },
      totalPaymentsReceived: {
        formattedCurrencyAndAmount: undefined,
        dataSortValue: 0,
      },
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus: 'TO DO',
    },
    {
      ...aFeeRecordViewModelItem(),
      id: 2,
      facilityId: '87654321',
      exporter: 'Test exporter 2',
      status: FEE_RECORD_STATUS.DOES_NOT_MATCH,
      displayStatus: 'DOES NOT MATCH',
    },
  ];

  const getWrapper = () => render({ feeRecords, enablePaymentsReceivedSorting: true });

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(9);
    wrapper.expectElement(`${tableSelector} thead th:contains("")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
  });

  it("should use the 'govuk-table__header--numeric' class for numeric columns", () => {
    const wrapper = getWrapper();
    const numericHeaderClass = 'govuk-table__header--numeric';
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).hasClass(numericHeaderClass);
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).hasClass(numericHeaderClass);
  });

  it("should set the payments received and total payments received column headers to sortable if 'enablePaymentsReceivedSorting' is set to true", () => {
    const wrapper = render({ feeRecords, enablePaymentsReceivedSorting: true });

    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toHaveAttribute('aria-sort', 'none');
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toHaveAttribute('aria-sort', 'none');
  });

  it("should not set the payments received and total payments received column headers to sortable if 'enablePaymentsReceivedSorting' is set to false", () => {
    const wrapper = render({ feeRecords, enablePaymentsReceivedSorting: false });

    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toHaveAttribute('aria-sort', undefined);
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toHaveAttribute('aria-sort', undefined);
  });

  it('should render the select all checkbox in the table headings row', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th input[type="checkbox"]#select-all-checkbox`).toExist();
  });

  it("should render the table data and use the 'govuk-table__cell--numeric' class for numeric cells", () => {
    const wrapper = getWrapper();
    const numericCellClass = 'govuk-table__cell--numeric';

    feeRecords.forEach((feeRecord) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecord.id}"]`;

      wrapper.expectElement(`${rowSelector} input[type="checkbox"]`).toExist();

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${feeRecord.facilityId}")`).toExist();

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(8);
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.exporter}")`).toExist();

      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedFees.formattedCurrencyAndAmount}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedFees.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
      wrapper
        .expectElement(`${rowSelector} td:contains("${feeRecord.reportedFees.formattedCurrencyAndAmount}")`)
        .toHaveAttribute('data-sort-value', feeRecord.reportedFees.dataSortValue.toString());

      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedPayments.formattedCurrencyAndAmount}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedPayments.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
      wrapper
        .expectElement(`${rowSelector} td:contains("${feeRecord.reportedPayments.formattedCurrencyAndAmount}")`)
        .toHaveAttribute('data-sort-value', feeRecord.reportedPayments.dataSortValue.toString());

      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalReportedPayments.formattedCurrencyAndAmount}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalReportedPayments.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
      wrapper
        .expectElement(`${rowSelector} td:contains("${feeRecord.totalReportedPayments.formattedCurrencyAndAmount}")`)
        .toHaveAttribute('data-sort-value', feeRecord.totalReportedPayments.dataSortValue.toString());

      if (feeRecord.paymentsReceived.formattedCurrencyAndAmount) {
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.paymentsReceived.formattedCurrencyAndAmount}")`).toExist();
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.paymentsReceived.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
        wrapper
          .expectElement(`${rowSelector} td:contains("${feeRecord.paymentsReceived.formattedCurrencyAndAmount}")`)
          .toHaveAttribute('data-sort-value', feeRecord.paymentsReceived.dataSortValue.toString());
      }

      if (feeRecord.totalPaymentsReceived.formattedCurrencyAndAmount) {
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalPaymentsReceived.formattedCurrencyAndAmount}")`).toExist();
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalPaymentsReceived.formattedCurrencyAndAmount}")`).hasClass(numericCellClass);
        wrapper
          .expectElement(`${rowSelector} td:contains("${feeRecord.paymentsReceived.formattedCurrencyAndAmount}")`)
          .toHaveAttribute('data-sort-value', feeRecord.totalPaymentsReceived.dataSortValue.toString());
      }

      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.displayStatus}")`).toExist();
    });
  });

  const FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST = [FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH];

  it.each(FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST)('should render the checkbox when the fee record status is %s', (feeRecordStatus) => {
    const feeRecordViewModelItem = {
      ...aFeeRecordViewModelItem(),
      status: feeRecordStatus,
    };
    const wrapper = render({ feeRecords: [feeRecordViewModelItem] });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordViewModelItem.id}"]`;
    wrapper.expectElement(`${rowSelector} input[type="checkbox"]`).toExist();
  });

  it.each(difference(Object.values(FEE_RECORD_STATUS), FEE_RECORD_STATUSES_WHERE_CHECKBOX_SHOULD_EXIST))(
    'should not render the checkbox when the fee record status is %s',
    (feeRecordStatus) => {
      const feeRecordViewModelItem = {
        ...aFeeRecordViewModelItem(),
        status: feeRecordStatus,
      };
      const wrapper = render({ feeRecords: [feeRecordViewModelItem] });

      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordViewModelItem.id}"]`;
      wrapper.expectElement(`${rowSelector} input[type="checkbox"]`).notToExist();
    },
  );

  it("should render a checked checkbox id when the 'isChecked' property is set to true", () => {
    const feeRecordViewModelItem = {
      ...aFeeRecordViewModelItem(),
      isChecked: true,
    };
    const wrapper = render({ feeRecords: [feeRecordViewModelItem] });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordViewModelItem.id}"]`;
    wrapper.expectElement(`${rowSelector} input[type="checkbox"]`).toHaveAttribute('checked', 'checked');
  });

  it("should render an unchecked checkbox id when the 'isChecked' property is set to false", () => {
    const feeRecordViewModelItem = {
      ...aFeeRecordViewModelItem(),
      isChecked: false,
    };
    const wrapper = render({ feeRecords: [feeRecordViewModelItem] });

    const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordViewModelItem.id}"]`;
    wrapper.expectElement(`${rowSelector} input[type="checkbox"]`).toHaveAttribute('checked', undefined);
  });
});
