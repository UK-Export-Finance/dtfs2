import difference from 'lodash.difference';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { PaymentDetailsPaymentViewModel, PaymentDetailsViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-table-row.njk';
const render = componentRenderer(component, true);

type PaymentDetailsTableRow = PaymentDetailsViewModel[number];

describe(component, () => {
  const aPaymentDetailsPayment = (): PaymentDetailsPaymentViewModel => ({
    id: 1,
    amount: {
      formattedCurrencyAndAmount: 'GBP 100.00',
      dataSortValue: 0,
    },
    reference: undefined,
    dateReceived: {
      formattedDateReceived: '9 Mar 2024',
      dataSortValue: 0,
    },
  });

  const aPaymentDetailsTableRow = (): PaymentDetailsTableRow => ({
    feeRecordPaymentGroupStatus: FEE_RECORD_STATUS.TO_DO,
    payment: aPaymentDetailsPayment(),
    feeRecords: [{ facilityId: '12345678', exporter: 'Test exporter' }],
    reconciledBy: '-',
    dateReconciled: {
      formattedDateReconciled: '-',
      dataSortValue: 0,
    },
  });

  const getWrapper = ({ reportId, paymentDetailsRow, userCanEdit }: { reportId?: number; paymentDetailsRow: PaymentDetailsTableRow; userCanEdit?: boolean }) =>
    render({ reportId, paymentDetails: paymentDetailsRow, userCanEdit });

  it('renders the payment reference and amount, the fee record facility ID and exporter and the date reconciled and reconciled by user', () => {
    const paymentDetailsRow: PaymentDetailsTableRow = {
      ...aPaymentDetailsTableRow(),
      payment: {
        ...aPaymentDetailsPayment(),
        amount: {
          formattedCurrencyAndAmount: 'GBP 123.45',
          dataSortValue: 0,
        },
        reference: 'Some payment reference',
      },
      feeRecords: [
        {
          facilityId: 'Some facility id',
          exporter: 'Some exporter',
        },
      ],
      dateReconciled: { formattedDateReconciled: 'Some date reconciled', dataSortValue: 0 },
      reconciledBy: 'Some reconciled by user',
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td:contains("GBP 123.45")`).toExist();
    wrapper.expectElement(`tr td:contains("Some payment reference")`).toExist();
    wrapper.expectElement(`tr td:contains("Some facility id")`).toExist();
    wrapper.expectElement(`tr td:contains("Some exporter")`).toExist();
    wrapper.expectElement(`tr td:contains("Some date reconciled")`).toExist();
    wrapper.expectElement(`tr td:contains("Some reconciled by user")`).toExist();
  });

  it.each([
    { column: 'reconciled by', property: 'reconciledBy' },
    { column: 'date reconciled', property: 'dateReconciled' },
  ] as const)("renders the '-' character when the $column column is undefined", ({ property }) => {
    const paymentDetailsRow: PaymentDetailsTableRow = {
      ...aPaymentDetailsTableRow(),
      [property]: undefined,
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td[data-cy="${property}"]:contains("-")`).toExist();
  });

  it.each([
    { column: 'reconciled by', property: 'reconciledBy' },
    { column: 'date reconciled', property: 'dateReconciled' },
  ] as const)('renders the $column column', ({ property }) => {
    const paymentDetailsRow: PaymentDetailsTableRow = {
      ...aPaymentDetailsTableRow(),
      [property]: 'Some custom property',
    };
    const wrapper = getWrapper({ paymentDetailsRow });

    wrapper.expectElement(`tr td[data-cy="${property}"]:contains("Some custom property")`).toExist();
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it.each([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED])(
      'renders the payment amount as plain text when the fee record status is %s',
      (status) => {
        const paymentDetailsRow: PaymentDetailsTableRow = {
          ...aPaymentDetailsTableRow(),
          feeRecordPaymentGroupStatus: status,
          payment: {
            ...aPaymentDetailsPayment(),
            amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
          },
        };
        const wrapper = getWrapper({ paymentDetailsRow, userCanEdit });

        wrapper.expectElement('tr td:contains("GBP 123.45")').toExist();
        wrapper.expectElement('tr a:contains("GBP 123.45")').notToExist();
      },
    );

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]))(
      'renders the payment amount as a link to the edit payment page when the fee record status is %s',
      (status) => {
        const paymentDetailsRow: PaymentDetailsTableRow = {
          ...aPaymentDetailsTableRow(),
          feeRecordPaymentGroupStatus: status,
          payment: {
            ...aPaymentDetailsPayment(),
            id: 24,
            amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
          },
        };
        const wrapper = getWrapper({ reportId: 12, paymentDetailsRow, userCanEdit });

        wrapper.expectElement('tr td:contains(a)').toExist();
        wrapper.expectLink('td a').toLinkTo('/utilisation-reports/12/edit-payment/24', 'GBP 123.45');
      },
    );
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it.each(Object.values(FEE_RECORD_STATUS))('renders the payment amount as plain text when the fee record status is %s', (status) => {
      const paymentDetailsRow: PaymentDetailsTableRow = {
        ...aPaymentDetailsTableRow(),
        feeRecordPaymentGroupStatus: status,
        payment: {
          ...aPaymentDetailsPayment(),
          amount: { formattedCurrencyAndAmount: 'GBP 123.45', dataSortValue: 0 },
        },
      };
      const wrapper = getWrapper({ paymentDetailsRow, userCanEdit });

      wrapper.expectElement('tr td:contains("GBP 123.45")').toExist();
      wrapper.expectElement('tr a:contains("GBP 123.45")').notToExist();
    });
  });

  describe('when there are multiple fee records for the payment', () => {
    const aFeeRecord = (): { facilityId: string; exporter: string } => ({
      facilityId: '12345678',
      exporter: 'Test exporter',
    });

    it('renders as many rows as there are fee records', () => {
      const paymentDetailsRow: PaymentDetailsTableRow = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr').toHaveCount(3);
    });

    it('renders the non-fee record payment details data only in the first row', () => {
      const paymentDetailsRow: PaymentDetailsTableRow = {
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
            formattedDateReceived: 'Some date received',
            dataSortValue: 0,
          },
        },
        reconciledBy: 'Some reconciled by user',
        dateReconciled: {
          formattedDateReconciled: 'Some reconciled date',
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

      wrapper.expectElement('tr:eq(0) td:contains("Some date received")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Some date received")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Some date received")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled by user")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Some reconciled by user")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Some reconciled by user")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled date")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Some reconciled date")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Some reconciled date")').notToExist();
    });

    it('sets the data sort value for each row to match the value in the first row for the non-fee record columns', () => {
      const paymentDetailsRow: PaymentDetailsTableRow = {
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
            formattedDateReceived: 'Some date received',
            dataSortValue: 48,
          },
        },
        reconciledBy: 'Some reconciled by user',
        dateReconciled: {
          formattedDateReconciled: 'Some reconciled date',
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

      wrapper.expectElement('tr:eq(0) td:contains("Some date received")').toHaveAttribute('data-sort-value', '48');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="48"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="48"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled by user")').toHaveAttribute('data-sort-value', 'Some reconciled by user');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="Some reconciled by user"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="Some reconciled by user"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("Some reconciled date")').toHaveAttribute('data-sort-value', '36');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="36"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="36"]').toExist();
    });

    it('renders every cell except those in the last row using the no border class', () => {
      const paymentDetailsRow: PaymentDetailsTableRow = {
        ...aPaymentDetailsTableRow(),
        feeRecords: [aFeeRecord(), aFeeRecord(), aFeeRecord()],
      };
      const wrapper = getWrapper({ paymentDetailsRow });

      wrapper.expectElement('tr:eq(0) td.no-border').toHaveCount(7);
      wrapper.expectElement('tr:eq(1) td.no-border').toHaveCount(7);
      wrapper.expectElement('tr:eq(2) td.no-border').notToExist();
    });

    it('renders each of the fee records listed in the supplied array', () => {
      const feeRecords: { facilityId: string; exporter: string }[] = [
        { facilityId: '11111111', exporter: 'Test exporter 1' },
        { facilityId: '22222222', exporter: 'Test exporter 2' },
        { facilityId: '33333333', exporter: 'Test exporter 3' },
      ];
      const paymentDetailsRow: PaymentDetailsTableRow = {
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
