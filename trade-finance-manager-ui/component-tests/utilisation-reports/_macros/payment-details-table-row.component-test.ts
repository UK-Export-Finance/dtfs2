import difference from 'lodash.difference';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';
import { PaymentDetailsPaymentViewModel, PaymentDetailsRowViewModel } from '../../../server/types/view-models';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../../server/constants/reconciliation-for-report-tabs';

const component = '../templates/utilisation-reports/_macros/payment-details-table-row.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const aPaymentDetailsPayment = (): PaymentDetailsPaymentViewModel => ({
    id: 1,
    amount: {
      formattedCurrencyAndAmount: 'GBP 100.00',
      dataSortValue: 0,
    },
    dateReceived: {
      formattedDateReceived: '9 Mar 2024',
      dataSortValue: 0,
    },
  });

  const aPaymentDetailsTableRow = (): PaymentDetailsRowViewModel => ({
    payment: aPaymentDetailsPayment(),
    feeRecords: [{ id: 1, facilityId: '12345678', exporter: 'Test exporter' }],
    status: FEE_RECORD_STATUS.TO_DO,
    reconciledBy: '-',
    dateReconciled: {
      formattedDateReconciled: '-',
      dataSortValue: 0,
    },
  });

  const getWrapper = ({
    reportId,
    paymentDetailsRow,
    userCanEdit,
  }: {
    reportId?: number;
    paymentDetailsRow: PaymentDetailsRowViewModel;
    userCanEdit?: boolean;
  }) => render({ reportId, paymentDetails: paymentDetailsRow, userCanEdit });

  it('renders the payment reference and amount', () => {
    const paymentDetailsRow: PaymentDetailsRowViewModel = {
      ...aPaymentDetailsTableRow(),
      payment: {
        ...aPaymentDetailsPayment(),
        reference: 'Some payment reference',
        amount: {
          formattedCurrencyAndAmount: 'GBP 123.45',
          dataSortValue: 0,
        },
      },
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td:contains("Some payment reference")`).toExist();
    wrapper.expectElement(`tr td:contains("GBP 123.45")`).toExist();
  });

  it('renders the fee record facility ID and exporter', () => {
    const paymentDetailsRow: PaymentDetailsRowViewModel = {
      ...aPaymentDetailsTableRow(),
      feeRecords: [
        {
          id: 1,
          facilityId: 'Some facility id',
          exporter: 'Some exporter',
        },
      ],
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td:contains("Some facility id")`).toExist();
    wrapper.expectElement(`tr td:contains("Some exporter")`).toExist();
  });

  it('renders the date reconciled', () => {
    const paymentDetailsRow: PaymentDetailsRowViewModel = {
      ...aPaymentDetailsTableRow(),
      dateReconciled: { formattedDateReconciled: '12 May 2024', dataSortValue: 0 },
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td:contains("12 May 2024")`).toExist();
  });

  it('renders the reconciled by user', () => {
    const paymentDetailsRow: PaymentDetailsRowViewModel = {
      ...aPaymentDetailsTableRow(),
      reconciledBy: 'Some reconciled by user',
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td:contains("Some reconciled by user")`).toExist();
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it.each([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED])(
      'renders the payment amount as plain text when the fee record status is %s',
      (status) => {
        const paymentDetailsRow: PaymentDetailsRowViewModel = {
          ...aPaymentDetailsTableRow(),
          payment: {
            ...aPaymentDetailsPayment(),
            amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
          },
          status,
        };
        const wrapper = getWrapper({ paymentDetailsRow, userCanEdit });

        wrapper.expectElement('tr td:contains("GBP 123.45")').toExist();
        wrapper.expectElement('tr a:contains("GBP 123.45")').notToExist();
      },
    );

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]))(
      `renders the payment amount as a link to the edit payment page when the fee record status is %s with redirectTab set to ${RECONCILIATION_FOR_REPORT_TABS.PAYMENT_DETAILS}`,
      (status) => {
        const paymentDetailsRow: PaymentDetailsRowViewModel = {
          ...aPaymentDetailsTableRow(),
          payment: {
            ...aPaymentDetailsPayment(),
            id: 24,
            amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
          },
          status,
        };
        const wrapper = getWrapper({ reportId: 12, paymentDetailsRow, userCanEdit });

        wrapper.expectElement('tr td:contains(a)').toExist();
        wrapper
          .expectLink('td a')
          .toLinkTo(`/utilisation-reports/12/edit-payment/24?redirectTab=${RECONCILIATION_FOR_REPORT_TABS.PAYMENT_DETAILS}`, 'GBP 123.45');
      },
    );
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it.each(Object.values(FEE_RECORD_STATUS))('renders the payment amount as plain text when the fee record status is %s', (status) => {
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        payment: {
          ...aPaymentDetailsPayment(),
          amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
        },
        status,
      };
      const wrapper = getWrapper({ paymentDetailsRow, userCanEdit });

      wrapper.expectElement('tr td:contains("GBP 123.45")').toExist();
      wrapper.expectElement('tr a:contains("GBP 123.45")').notToExist();
    });
  });

  describe('when there are multiple fee records for the payment', () => {
    const aFeeRecord = (): { id: number; facilityId: string; exporter: string } => ({
      id: 1,
      facilityId: '12345678',
      exporter: 'Test exporter',
    });

    it('renders as many rows as there are fee records', () => {
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr').toHaveCount(3);
    });

    it('renders the non-fee record payment details data only in the first row', () => {
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
        payment: {
          ...aPaymentDetailsPayment(),
          reference: 'Some reference',
          amount: {
            formattedCurrencyAndAmount: 'GBP 100.00',
            dataSortValue: 0,
          },
          dateReceived: {
            formattedDateReceived: '12 May 2024',
            dataSortValue: 0,
          },
        },
        reconciledBy: 'Some reconciled by user',
        dateReconciled: {
          formattedDateReconciled: '12 Jun 2024',
          dataSortValue: 0,
        },
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("GBP 100.00")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("GBP 100.00")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("GBP 100.00")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reference")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Some reference")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Some reference")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("12 May 2024")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("12 May 2024")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("12 May 2024")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled by user")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Some reconciled by user")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Some reconciled by user")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("12 Jun 2024")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("12 Jun 2024")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("12 Jun 2024")').notToExist();
    });

    it('sets the data sort value for each row to match the value in the first row for the non-fee record columns', () => {
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
        payment: {
          ...aPaymentDetailsPayment(),
          reference: 'Some reference',
          amount: {
            formattedCurrencyAndAmount: 'GBP 100.00',
            dataSortValue: 12,
          },
          dateReceived: {
            formattedDateReceived: '12 May 2024',
            dataSortValue: 48,
          },
        },
        reconciledBy: 'Some reconciled by user',
        dateReconciled: {
          formattedDateReconciled: '12 Jun 2024',
          dataSortValue: 36,
        },
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("GBP 100.00")').toHaveAttribute('data-sort-value', '12');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="12"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="12"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reference")').toHaveAttribute('data-sort-value', 'Some reference');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="Some reference"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="Some reference"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("12 May 2024")').toHaveAttribute('data-sort-value', '48');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="48"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="48"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled by user")').toHaveAttribute('data-sort-value', 'Some reconciled by user');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="Some reconciled by user"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="Some reconciled by user"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("12 Jun 2024")').toHaveAttribute('data-sort-value', '36');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="36"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="36"]').toExist();
    });

    it('renders every cell except those in the last row using the no border class', () => {
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr:eq(0) td.no-border').toHaveCount(7);
      wrapper.expectElement('tr:eq(1) td.no-border').toHaveCount(7);
      wrapper.expectElement('tr:eq(2) td.no-border').notToExist();
    });

    it('renders each of the fee records listed in the supplied array', () => {
      const feeRecords: { id: number; facilityId: string; exporter: string }[] = [
        { id: 1, facilityId: '11111111', exporter: 'Test exporter 1' },
        { id: 1, facilityId: '22222222', exporter: 'Test exporter 2' },
        { id: 1, facilityId: '33333333', exporter: 'Test exporter 3' },
      ];
      const paymentDetailsRow: PaymentDetailsRowViewModel = {
        ...aPaymentDetailsTableRow(),
        feeRecords,
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("11111111")').toExist();
      wrapper.expectElement('tr:eq(0) td:contains("Test exporter 1")').toExist();

      wrapper.expectElement('tr:eq(1) td:contains("22222222")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Test exporter 2")').toExist();

      wrapper.expectElement('tr:eq(2) td:contains("33333333")').toExist();
      wrapper.expectElement('tr:eq(2) td:contains("Test exporter 3")').toExist();
    });
  });
});
