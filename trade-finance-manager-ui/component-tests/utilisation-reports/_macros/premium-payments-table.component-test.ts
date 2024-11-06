import difference from 'lodash.difference';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';
import { aPremiumPaymentsViewModelItem, aFeeRecordViewModelItem } from '../../../test-helpers';
import {
  PremiumPaymentsViewModelItem,
  FeeRecordViewModelItem,
  PaymentViewModelItem,
  SortedAndFormattedCurrencyAndAmount,
} from '../../../server/types/view-models';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../server/constants/reconciliation-for-report-tabs';
import { PremiumPaymentsTableCheckboxId } from '../../../server/types/premium-payments-table-checkbox-id';

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';
const tableSelector = '[data-cy="premium-payments-table"]';

type ComponentRendererParams = {
  reportId: number;
  userCanEdit: boolean;
  feeRecordPaymentGroups: PremiumPaymentsViewModelItem[];
  enablePaymentsReceivedSorting: boolean;
  hasSelectableRows: boolean;
};

const render = componentRenderer<ComponentRendererParams>(component);

describe(component, () => {
  const aPremiumPaymentsViewModelList = (): PremiumPaymentsViewModelItem[] => [
    {
      ...aPremiumPaymentsViewModelItem(),
      feeRecords: [
        {
          ...aFeeRecordViewModelItem(),
          id: 1,
          facilityId: '12345678',
          exporter: 'Test exporter 1',
        },
        {
          ...aFeeRecordViewModelItem(),
          id: 2,
          facilityId: '87654321',
          exporter: 'Test exporter 2',
        },
      ],
      paymentsReceived: undefined,
      totalPaymentsReceived: {
        formattedCurrencyAndAmount: undefined,
        dataSortValue: 0,
      },
      totalReportedPayments: {
        formattedCurrencyAndAmount: undefined,
        dataSortValue: 0,
      },
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus: 'TO DO',
      checkboxId: 'feeRecordIds-1,2-reportedPaymentsCurrency-GBP-status-TO_DO',
      isChecked: false,
      checkboxAriaLabel: '',
    },
  ];

  const defaultRendererParams = (): ComponentRendererParams => ({
    userCanEdit: true,
    reportId: 1,
    feeRecordPaymentGroups: aPremiumPaymentsViewModelList(),
    enablePaymentsReceivedSorting: true,
    hasSelectableRows: true,
  });

  const getWrapper = () => render(defaultRendererParams());

  const numericCellClass = 'govuk-table__cell--numeric';

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

  it('should render the alternative hidden header as visually hidden', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="premium-payments-table--hidden-header"]').hasClass('govuk-visually-hidden');
  });

  it("should use the 'govuk-table__header--numeric' class for numeric columns", () => {
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
    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups: aPremiumPaymentsViewModelList(), enablePaymentsReceivedSorting: true });

    wrapper.expectElement('[data-cy="premium-payments-table--total-payments-received-header"]').toHaveAttribute('aria-sort', 'none');
  });

  it("should not set the total payments received column header to sortable if 'enablePaymentsReceivedSorting' is set to false", () => {
    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups: aPremiumPaymentsViewModelList(), enablePaymentsReceivedSorting: false });

    wrapper.expectElement('[data-cy="premium-payments-table--total-payments-received-header"]').notToHaveAttribute('aria-sort');
  });

  it('should render the select all checkbox in the table headings row when userCanEdit is true and hasSelectableRows is true', () => {
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, hasSelectableRows: true });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).toExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is false and hasSelectableRows is true', () => {
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: false, hasSelectableRows: true });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is true and hasSelectableRows is false', () => {
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, hasSelectableRows: false });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });

  it('should not render the select all checkbox in the table headings row when userCanEdit is false and hasSelectableRows is false', () => {
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: false, hasSelectableRows: false });
    wrapper.expectElement(`${tableSelector} [data-cy="table-cell-checkbox--select-all"]`).notToExist();
  });

  it('should render message informing there are no matched records when no fee record groups', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectElement('[data-cy="no-matched-facilities-message"]').toExist();
    wrapper.expectText('[data-cy="no-matched-facilities-message"]').toContain('Your search matched no facilities');
    wrapper.expectText('[data-cy="no-matched-facilities-message"]').toContain('There are no results for the facility ID you entered');
  });

  it('should not render message informing there are no matched records when at least one fee record group is returned', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [aFeeRecordViewModelItem()],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectElement('[data-cy="no-matched-facilities-message"]').notToExist();
    wrapper.expectText('html').notToContain('Your search matched no facilities');
    wrapper.expectText('html').notToContain('There are no results for the facility ID you entered');
  });

  it('should render a row for each fee record defined in each fee record payment group', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems: FeeRecordViewModelItem[] = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItems[0], feeRecordItems[1]],
      },
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItems[2]],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectElement(`tr`).toHaveCount(feeRecordIds.length + 1); // including table header
    feeRecordIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(rowSelector).toExist();
    });
  });

  it('should render visually hidden cell in first row of group displaying fee record details', () => {
    const firstFeeRecordItem: FeeRecordViewModelItem = {
      id: 1,
      facilityId: '111111',
      exporter: 'Test exporter 1',
      reportedFees: 'GBP 100.00',
      reportedPayments: 'EUR 100.00',
    };
    const secondFeeRecordItem: FeeRecordViewModelItem = {
      id: 2,
      facilityId: '222222',
      exporter: 'Test exporter 2',
      reportedFees: 'GBP 200.00',
      reportedPayments: 'EUR 200.00',
    };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [firstFeeRecordItem, secondFeeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const firstRowHiddenCellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstFeeRecordItem.id}-hidden-record-details"]`;
    wrapper.expectElement(firstRowHiddenCellSelector).toExist();
    wrapper.expectElement(`${firstRowHiddenCellSelector} ul`).toExist();
    wrapper.expectElement(`${firstRowHiddenCellSelector} li`).toHaveCount(2);
    wrapper
      .expectText(`${firstRowHiddenCellSelector} li:nth-of-type(1)`)
      .toRead(
        `Facility ID: ${firstFeeRecordItem.facilityId}, Exporter: ${firstFeeRecordItem.exporter}, Reported fees: ${firstFeeRecordItem.reportedFees}, Reported payments: ${firstFeeRecordItem.reportedPayments}`,
      );
    wrapper
      .expectText(`${firstRowHiddenCellSelector} li:nth-of-type(2)`)
      .toRead(
        `Facility ID: ${secondFeeRecordItem.facilityId}, Exporter: ${secondFeeRecordItem.exporter}, Reported fees: ${secondFeeRecordItem.reportedFees}, Reported payments: ${secondFeeRecordItem.reportedPayments}`,
      );

    const secondRowHiddenCellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${secondFeeRecordItem.id}-hidden-record-details"]`;
    wrapper.expectElement(secondRowHiddenCellSelector).toExist();
    wrapper.expectElement(`${secondRowHiddenCellSelector} ul`).notToExist();
  });

  it.each`
    columnName             | selector
    ${'Facility ID'}       | ${'[data-cy="premium-payments-table-row--feeRecordId-1-facility-id"]'}
    ${'Exporter'}          | ${'[data-cy="premium-payments-table-row--feeRecordId-1-exporter"]'}
    ${'Reported Fees'}     | ${'[data-cy="premium-payments-table-row--feeRecordId-1-reported-fees"]'}
    ${'Reported payments'} | ${'[data-cy="premium-payments-table-row--feeRecordId-1-reported-payments"]'}
  `("should set the '$columnName' column cell to be aria-hidden", ({ selector }: { selector: string }) => {
    const feeRecordItem: FeeRecordViewModelItem = {
      ...aFeeRecordViewModelItem(),
      id: 1,
    };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectElement(selector).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render the fee record facility id in the table row with the matching fee record id', () => {
    const feeRecordId = 1;
    const facilityId = '31459265';
    const feeRecordItem: FeeRecordViewModelItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, facilityId };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectText(`[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-facility-id"]`).toRead(facilityId);
  });

  it('should render the fee record exporter in the table row with the matching fee record id', () => {
    const feeRecordId = 1;
    const exporter = 'Some exporter';
    const feeRecordItem: FeeRecordViewModelItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, exporter };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectText(`[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-exporter"]`).toRead(exporter);
  });

  it('should render the fee record reported fees in the table row with the matching fee record id with the numeric cell class', () => {
    const feeRecordId = 1;
    const reportedFees = 'EUR 12345.67';
    const feeRecordItem: FeeRecordViewModelItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, reportedFees };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-reported-fees"]`;
    wrapper.expectText(cellSelector).toRead(reportedFees);
    wrapper.expectElement(cellSelector).hasClass(numericCellClass);
  });

  it('should render the fee record reported payments in the table row with the matching fee record id with the numeric cell class', () => {
    const feeRecordId = 1;
    const reportedPayments = 'GBP 76543.21';
    const feeRecordItem: FeeRecordViewModelItem = { ...aFeeRecordViewModelItem(), id: feeRecordId, reportedPayments };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: [feeRecordItem],
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-reported-payments"]`;
    wrapper.expectText(cellSelector).toRead(reportedPayments);
    wrapper.expectElement(cellSelector).hasClass(numericCellClass);
  });

  it('should only render the total reported payments in the first row of the fee record payment group with the numeric cell class and the data sort value', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const totalReportedPayments: SortedAndFormattedCurrencyAndAmount = {
      formattedCurrencyAndAmount: 'EUR 123.45',
      dataSortValue: 0,
    };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        totalReportedPayments,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowCellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}-total-reported-payments"]`;
    wrapper.expectText(firstRowCellSelector).toRead(totalReportedPayments.formattedCurrencyAndAmount!);
    wrapper.expectElement(firstRowCellSelector).hasClass(numericCellClass);
    wrapper.expectElement(firstRowCellSelector).toHaveAttribute('data-sort-value', totalReportedPayments.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(rowSelector).toExist();

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}-total-reported-payments"]`;
      wrapper.expectText(cellSelector).toRead('');
    });
  });

  it('should only render the payments received in the first row of the fee record payment group with the numeric cell class', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const paymentsReceived: PaymentViewModelItem[] = [{ id: 1, formattedCurrencyAndAmount: 'GBP 100.00' }];
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowCellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}-payments-received"]`;
    wrapper.expectElement(firstRowCellSelector).toExist();
    wrapper.expectElement(firstRowCellSelector).hasClass(numericCellClass);
    wrapper.expectElement(`${firstRowCellSelector} ul`).toExist();

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(rowSelector).toExist();

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}-payments-received"]`;
      wrapper.expectElement(`${cellSelector} ul`).notToExist();
    });
  });

  it('should render a list item for each item in the group payments received list', () => {
    const feeRecordId = 1;
    const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

    const paymentsReceived: PaymentViewModelItem[] = [
      { id: 1, formattedCurrencyAndAmount: 'GBP 100.00' },
      { id: 2, formattedCurrencyAndAmount: 'GBP 200.00' },
      { id: 3, formattedCurrencyAndAmount: 'GBP 300.00' },
    ];
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-payments-received"]`;
    wrapper.expectElement(`${cellSelector} li`).toHaveCount(paymentsReceived.length);
  });

  const FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS = [FEE_RECORD_STATUS.MATCH, FEE_RECORD_STATUS.DOES_NOT_MATCH];

  it.each(FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS)(
    `should render the payments received as links to the edit payment page when userCanEdit is true and the fee record status is '%s' with redirectTab query set to ${RECONCILIATION_FOR_REPORT_TABS.PREMIUM_PAYMENTS}`,
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived: PaymentViewModelItem[] = [
        { id: 1, formattedCurrencyAndAmount: 'GBP 100.00' },
        { id: 2, formattedCurrencyAndAmount: 'GBP 200.00' },
      ];

      const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
        {
          ...aPremiumPaymentsViewModelItem(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const reportId = 12;

      const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, reportId, feeRecordPaymentGroups });

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-payments-received"]`;
      paymentsReceived.forEach((payment) => {
        wrapper
          .expectLink(`${cellSelector} a:contains(${payment.formattedCurrencyAndAmount})`)
          .toLinkTo(
            `/utilisation-reports/${reportId}/edit-payment/${payment.id}?redirectTab=${RECONCILIATION_FOR_REPORT_TABS.PREMIUM_PAYMENTS}`,
            payment.formattedCurrencyAndAmount,
          );
      });
    },
  );

  it.each(difference(Object.values(FEE_RECORD_STATUS), FEE_RECORD_STATUSES_WHERE_PAYMENTS_RECEIVED_SHOULD_BE_LINKS))(
    "should render the payments received as plain text when userCanEdit is true and the status is '%s'",
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived: PaymentViewModelItem[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', id: 1 },
        { formattedCurrencyAndAmount: 'GBP 200.00', id: 2 },
      ];

      const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
        {
          ...aPremiumPaymentsViewModelItem(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-payments-received"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${cellSelector} li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${cellSelector} a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
      });
    },
  );

  it.each(Object.values(FEE_RECORD_STATUS))(
    "should render all payments received as plain text when userCanEdit is false, regardless of fee record status '%s'",
    (status) => {
      const feeRecordId = 1;
      const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

      const paymentsReceived: PaymentViewModelItem[] = [
        { formattedCurrencyAndAmount: 'GBP 100.00', id: 1 },
        { formattedCurrencyAndAmount: 'GBP 200.00', id: 2 },
      ];

      const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
        {
          ...aPremiumPaymentsViewModelItem(),
          feeRecords: feeRecordItems,
          status,
          paymentsReceived,
        },
      ];

      const reportId = 12;

      const wrapper = render({ ...defaultRendererParams(), userCanEdit: false, reportId, feeRecordPaymentGroups });

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-payments-received"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${cellSelector} li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${cellSelector} a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
      });
    },
  );

  it('should not render the payments received list when the group payments received is undefined', () => {
    const feeRecordId = 1;
    const feeRecordItems = [{ ...aFeeRecordViewModelItem(), id: feeRecordId }];

    const paymentsReceived = undefined;
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        paymentsReceived,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-payments-received"]`;
    wrapper.expectElement(`${cellSelector} ul`).notToExist();
  });

  it('should only render the total payments received in the first row of the fee record payment group with the numeric cell class and the data sort value', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const totalPaymentsReceived: SortedAndFormattedCurrencyAndAmount = {
      formattedCurrencyAndAmount: 'EUR 123.45',
      dataSortValue: 0,
    };
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        totalPaymentsReceived,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowCellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}-total-payments-received"]`;
    wrapper.expectText(firstRowCellSelector).toRead(totalPaymentsReceived.formattedCurrencyAndAmount!);
    wrapper.expectElement(firstRowCellSelector).hasClass(numericCellClass);
    wrapper.expectElement(firstRowCellSelector).toHaveAttribute('data-sort-value', totalPaymentsReceived.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(rowSelector).toExist();

      const cellSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}-total-payments-received"]`;
      wrapper.expectText(cellSelector).toRead('');
    });
  });

  it('should render the checkbox when userCanEdit and hasSelectableRows are true, and the fee record status is selectable', () => {
    const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-1-reportedPaymentsCurrency-GBP-status-TO_DO`;
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        isSelectable: true,
        checkboxId,
      },
    ];

    const wrapper = render({
      ...defaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).toExist();
  });

  it('should not render the checkbox when userCanEdit and hasSelectableRows are true, and the fee record is not selectable', () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        isSelectable: false,
        checkboxId,
      },
    ];

    const wrapper = render({
      ...defaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    wrapper.expectElement(`input#${checkboxId}[type="checkbox"]`).notToExist();
  });

  it('should not render any checkboxes when userCanEdit is false', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = Object.values(FEE_RECORD_STATUS).map((status) => ({
      ...aPremiumPaymentsViewModelItem(),
      status,
      checkboxId: `feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-${status}`,
    }));
    const wrapper = render({
      ...defaultRendererParams(),
      userCanEdit: false,
      hasSelectableRows: true,
      feeRecordPaymentGroups,
    });

    feeRecordPaymentGroups.forEach((group) => {
      wrapper.expectElement(`input#${group.checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it('should not render any checkboxes when hasSelectableRows is false', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = Object.values(FEE_RECORD_STATUS).map((status) => ({
      ...aPremiumPaymentsViewModelItem(),
      status,
      checkboxId: `feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-${status}`,
    }));
    const wrapper = render({
      ...defaultRendererParams(),
      userCanEdit: true,
      hasSelectableRows: false,
      feeRecordPaymentGroups,
    });

    feeRecordPaymentGroups.forEach((group) => {
      wrapper.expectElement(`input#${group.checkboxId}[type="checkbox"]`).notToExist();
    });
  });

  it('should render a checkbox with the checkbox id specified in the group only in the first row of the group', () => {
    const feeRecordIds = [1, 2, 3];
    const feeRecordItems = feeRecordIds.map((id) => ({ ...aFeeRecordViewModelItem(), id }));

    const checkboxId: PremiumPaymentsTableCheckboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        feeRecords: feeRecordItems,
        checkboxId,
      },
    ];

    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectElement(`${firstRowSelector} td input[id="${checkboxId}"][type="checkbox"]`).toExist();

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} td input[id="${checkboxId}"][type="checkbox"]`).notToExist();
    });
  });

  it("should render a checked checkbox id when the 'isChecked' property is set to true", () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: true,
      },
    ];
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.toHaveAttribute('checked', 'checked');
  });

  it("should render an unchecked checkbox id when the 'isChecked' property is set to false", () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxId,
        isChecked: false,
      },
    ];
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    const checkboxElement = wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`);

    checkboxElement.toExist();
    checkboxElement.notToHaveAttribute('checked');
  });

  it('should set aria-labels for checkboxes', () => {
    const checkboxId = 'feeRecordIds-1,2,3-reportedPaymentsCurrency-GBP-status-TO_DO';
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [
      {
        ...aPremiumPaymentsViewModelItem(),
        status: FEE_RECORD_STATUS.TO_DO,
        checkboxAriaLabel: 'select me!',
        checkboxId,
      },
    ];
    const wrapper = render({ ...defaultRendererParams(), userCanEdit: true, feeRecordPaymentGroups });

    wrapper.expectElement(`input[id="${checkboxId}"][type="checkbox"]`).toHaveAttribute('aria-label', 'select me!');
  });
});
