import difference from 'lodash.difference';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../../componentRenderer';
import { aPremiumPaymentsViewModelItem, aFeeRecordViewModelItem } from '../../../../test-helpers';
import {
  PremiumPaymentsViewModelItem,
  FeeRecordViewModelItem,
  PaymentViewModelItem,
  SortedAndFormattedCurrencyAndAmount,
} from '../../../../server/types/view-models';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../../server/constants/reconciliation-for-report-tabs';
import { aPremiumPaymentsTableDefaultRendererParams, PremiumPaymentsTableComponentRendererParams } from './helpers';

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';

const render = componentRenderer<PremiumPaymentsTableComponentRendererParams>(component);

describe(component, () => {
  const numericCellClass = 'govuk-table__cell--numeric';

  it('should not render error message if none provided', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), errorMessage: undefined });

    wrapper.expectElement('[data-cy="premium-payments-table--error"]').notToExist();
  });

  it('should render error message if provided', () => {
    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), errorMessage: 'This is an error message' });

    wrapper.expectElement('[data-cy="premium-payments-table--error"]').toExist();
    wrapper.expectText('[data-cy="premium-payments-table--error"]').toRead('Error: This is an error message');
    wrapper.expectText('[data-cy="premium-payments-table--error"] span').toRead('Error:');
    wrapper.expectElement('[data-cy="premium-payments-table--error"] span').hasClass('govuk-visually-hidden');
  });

  it('should render message informing there are no matched records when no fee record groups', () => {
    const feeRecordPaymentGroups: PremiumPaymentsViewModelItem[] = [];

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    wrapper.expectElement(`tr`).toHaveCount(feeRecordIds.length + 1); // including table header
    feeRecordIds.forEach((id) => {
      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${id}"]`;
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const firstRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${firstFeeRecordItem.id}"]`;
    const firstRowHiddenCellSelector = `${firstRowSelector} [data-cy="hidden-record-details"]`;
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

    const secondRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${secondFeeRecordItem.id}"]`;
    const secondRowHiddenCellSelector = `${secondRowSelector} [data-cy="hidden-record-details"]`;
    wrapper.expectElement(secondRowHiddenCellSelector).toExist();
    wrapper.expectElement(`${secondRowHiddenCellSelector} ul`).notToExist();
  });

  it.each`
    columnName             | selector
    ${'Facility ID'}       | ${'[data-cy*="premium-payments-table-row--feeRecordId-1"] [data-cy="facility-id"]'}
    ${'Exporter'}          | ${'[data-cy*="premium-payments-table-row--feeRecordId-1"] [data-cy="exporter"]'}
    ${'Reported Fees'}     | ${'[data-cy*="premium-payments-table-row--feeRecordId-1"] [data-cy="reported-fees"]'}
    ${'Reported payments'} | ${'[data-cy*="premium-payments-table-row--feeRecordId-1"] [data-cy="reported-payments"]'}
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectText(`${rowSelector} [data-cy="facility-id"]`).toRead(facilityId);
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectText(`${rowSelector} [data-cy="exporter"]`).toRead(exporter);
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectText(`${rowSelector} [data-cy="reported-fees"]`).toRead(reportedFees);
    wrapper.expectElement(`${rowSelector} [data-cy="reported-fees"]`).hasClass(numericCellClass);
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectText(`${rowSelector} [data-cy="reported-payments"]`).toRead(reportedPayments);
    wrapper.expectElement(`${rowSelector} [data-cy="reported-payments"]`).hasClass(numericCellClass);
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    wrapper.expectText(`${firstRowSelector} [data-cy="total-reported-payments"]`).toRead(totalReportedPayments.formattedCurrencyAndAmount!);
    wrapper.expectElement(`${firstRowSelector} [data-cy="total-reported-payments"]`).hasClass(numericCellClass);
    wrapper
      .expectElement(`${firstRowSelector} [data-cy="total-reported-payments"]`)
      .toHaveAttribute('data-sort-value', totalReportedPayments.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectText(`${rowSelector} [data-cy="total-reported-payments"]`).toRead('');
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    const cellSelector = '[data-cy="payments-received"]';
    wrapper.expectElement(`${firstRowSelector} ${cellSelector}`).toExist();
    wrapper.expectElement(`${firstRowSelector} ${cellSelector}`).hasClass(numericCellClass);
    wrapper.expectElement(`${firstRowSelector} ${cellSelector} ul`).toExist();

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectElement(`${rowSelector} ${cellSelector} ul`).notToExist();
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] li`).toHaveCount(paymentsReceived.length);
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

      const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: true, reportId, feeRecordPaymentGroups });

      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;

      paymentsReceived.forEach((payment) => {
        wrapper
          .expectLink(`${rowSelector} [data-cy="payments-received"] a:contains(${payment.formattedCurrencyAndAmount})`)
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

      const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
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

      const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), userCanEdit: false, reportId, feeRecordPaymentGroups });

      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
      paymentsReceived.forEach((payment) => {
        wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] li:contains(${payment.formattedCurrencyAndAmount})`).toExist();
        wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] a:contains(${payment.formattedCurrencyAndAmount})`).notToExist();
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`;
    wrapper.expectElement(`${rowSelector} [data-cy="payments-received"] ul`).notToExist();
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

    const wrapper = render({ ...aPremiumPaymentsTableDefaultRendererParams(), feeRecordPaymentGroups });

    const [firstRowId, ...otherIds] = feeRecordIds;

    const firstRowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${firstRowId}"]`;
    const firstRowCellSelector = `${firstRowSelector} [data-cy="total-payments-received"]`;
    wrapper.expectText(firstRowCellSelector).toRead(totalPaymentsReceived.formattedCurrencyAndAmount!);
    wrapper.expectElement(firstRowCellSelector).hasClass(numericCellClass);
    wrapper.expectElement(firstRowCellSelector).toHaveAttribute('data-sort-value', totalPaymentsReceived.dataSortValue.toString());

    otherIds.forEach((id) => {
      const rowSelector = `[data-cy*="premium-payments-table-row--feeRecordId-${id}"]`;
      wrapper.expectElement(`${rowSelector}`).toExist();
      wrapper.expectText(`${rowSelector} [data-cy="total-payments-received"]`).toRead('');
    });
  });
});
