import { CURRENCY, CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { KeyingSheetViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/keying-sheet-table-row.njk';
const render = componentRenderer(component, true);

type KeyingSheetTableRow = KeyingSheetViewModel[number];

describe(component, () => {
  const aKeyingSheetTableRow = (): KeyingSheetTableRow => ({
    status: 'TO_DO',
    displayStatus: 'To do',
    feeRecordId: 12,
    facilityId: '12345678',
    exporter: 'Test exporter',
    baseCurrency: CURRENCY.GBP,
    feePayments: [
      {
        formattedCurrencyAndAmount: 'GBP 100.00',
        formattedDateReceived: 'Some date',
      },
    ],
    checkboxId: 'feeRecordId-1-status-TO_DO',
    isChecked: false,
  });

  const getWrapper = ({ keyingSheetRow, userCanEdit }: { keyingSheetRow?: KeyingSheetTableRow; userCanEdit?: boolean } = {}) =>
    render({ keyingSheetRow: keyingSheetRow ?? aKeyingSheetTableRow(), userCanEdit: userCanEdit ?? true });

  it('renders the keying sheet status, facility id, exporter, base currency and fee payment in the table row when keying sheet row has fee payments', () => {
    const keyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      status: 'TO_DO',
      displayStatus: 'To do',
      facilityId: 'some facility id',
      exporter: 'some exporter',
      baseCurrency: 'EUR',
      feePayments: [
        {
          formattedCurrencyAndAmount: 'GBP 100.00',
          formattedDateReceived: 'Some date',
        },
      ],
    };
    const wrapper = getWrapper({ keyingSheetRow });

    wrapper.expectElement(`tr td:contains("To do")`).toExist();
    wrapper.expectElement(`tr td:contains("some facility id")`).toExist();
    wrapper.expectElement(`tr td:contains("some exporter")`).toExist();
    wrapper.expectElement(`tr td:contains("EUR")`).toExist();
  });

  it('renders the keying sheet status, facility id, exporter, base currency and fee payment in the table row when keying sheet row does not have fee payments', () => {
    const keyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      status: 'TO_DO',
      displayStatus: 'To do',
      facilityId: 'some facility id',
      exporter: 'some exporter',
      baseCurrency: 'EUR',
      feePayments: [],
    };
    const wrapper = getWrapper({ keyingSheetRow });

    wrapper.expectElement(`tr td:contains("To do")`).toExist();
    wrapper.expectElement(`tr td:contains("some facility id")`).toExist();
    wrapper.expectElement(`tr td:contains("some exporter")`).toExist();
    wrapper.expectElement(`tr td:contains("EUR")`).toExist();
  });

  it('renders dashes in the payment column when keying sheet row has no fee payments', () => {
    const keyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      feePayments: [],
    };
    const wrapper = getWrapper({ keyingSheetRow });

    wrapper.expectText('tr td[data-cy="keying-sheet-fee-payment-currency-and-amount"]').toRead('-');
    wrapper.expectText('tr td[data-cy="keying-sheet-fee-payment-date-received"]').toRead('-');
  });

  it('renders the fee payment column with the numeric cell class and date received column', () => {
    const keyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      feePayments: [
        {
          formattedCurrencyAndAmount: 'GBP 111.11',
          formattedDateReceived: 'Some date',
        },
      ],
    };
    const wrapper = getWrapper({ keyingSheetRow });

    wrapper.expectElement('tr td:contains("GBP 111.11")').toExist();
    wrapper.expectElement('tr td:contains("GBP 111.11")').hasClass('govuk-table__cell--numeric');
    wrapper.expectElement('tr td:contains("Some date")').toExist();
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it('renders the select fee record checkbox with the supplied checkbox id', () => {
      const keyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), checkboxId: 'feeRecordId-123-status-DONE' };
      const wrapper = getWrapper({ userCanEdit, keyingSheetRow });

      wrapper.expectElement('tr input[type="checkbox"]#feeRecordId-123-status-DONE').toExist();
    });

    it('renders the select fee record checkbox as checked when isChecked is set to true', () => {
      const keyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), isChecked: true };
      const wrapper = getWrapper({ userCanEdit, keyingSheetRow });

      wrapper.expectElement('tr input[type="checkbox"]').toHaveCount(1);
      wrapper.expectInput('tr input[type="checkbox"]').toBeChecked();
    });

    it('renders the select fee record checkbox as not checked when isChecked is set to false', () => {
      const keyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), isChecked: false };
      const wrapper = getWrapper({ userCanEdit, keyingSheetRow });

      wrapper.expectElement('tr input[type="checkbox"]').toHaveCount(1);
      wrapper.expectInput('tr input[type="checkbox"]').notToBeChecked();
    });
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it('does not render the select fee record checkbox', () => {
      const wrapper = getWrapper({ userCanEdit });

      wrapper.expectElement('tr input[type="checkbox"]').notToExist();
    });
  });

  describe('when there are multiple fee payments for the facility', () => {
    const aFeePayment = (): { formattedCurrencyAndAmount: CurrencyAndAmountString; formattedDateReceived: string } => ({
      formattedCurrencyAndAmount: 'GBP 111.11',
      formattedDateReceived: 'January 1',
    });

    it('renders as many rows as there are fee payments', () => {
      const keyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ keyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);
    });

    it('renders the non-fee payment keying sheet data and checkbox only in the first row', () => {
      const keyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        status: 'TO_DO',
        displayStatus: 'To do',
        baseCurrency: 'EUR',
        checkboxId: 'feeRecordId-123-status-TO_DO',
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ keyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("To do")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("To do")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("To do")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("12345678")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("12345678")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("12345678")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Test exporter 1")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Test exporter 1")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Test exporter 1")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("EUR")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("EUR")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("EUR")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("-")').toHaveCount(4);
      wrapper.expectElement('tr:eq(1) td:contains("-")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("-")').notToExist();

      wrapper.expectElement('tr:eq(0) td:has(input[type="checkbox"])').toExist();
      wrapper.expectElement('tr:eq(1) td:has(input[type="checkbox"])').notToExist();
      wrapper.expectElement('tr:eq(2) td:has(input[type="checkbox"])').notToExist();
    });

    it('sets the data sort value for each row to match the value in the first row for the status, facility id and exporter', () => {
      const keyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        status: 'TO_DO',
        displayStatus: 'To do',
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ keyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("To do")').toHaveAttribute('data-sort-value', 'TO_DO');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="TO_DO"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="TO_DO"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("12345678")').toHaveAttribute('data-sort-value', '12345678');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="12345678"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="12345678"]').toExist();

      wrapper.expectElement('tr:eq(0) td:contains("Test exporter 1")').toHaveAttribute('data-sort-value', 'Test exporter 1');
      wrapper.expectElement('tr:eq(1) td[data-sort-value="Test exporter 1"]').toExist();
      wrapper.expectElement('tr:eq(2) td[data-sort-value="Test exporter 1"]').toExist();
    });

    it('renders every cell except those in the last row using the no border class', () => {
      const keyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ keyingSheetRow });

      wrapper.expectElement('tr:eq(0) td.no-border').toHaveCount(11);
      wrapper.expectElement('tr:eq(1) td.no-border').toHaveCount(11);
      wrapper.expectElement('tr:eq(2) td.no-border').notToExist();
    });

    it('renders each of the fee payments listed in the supplied array', () => {
      const feePayments: { formattedCurrencyAndAmount: CurrencyAndAmountString; formattedDateReceived: string }[] = [
        { formattedCurrencyAndAmount: 'GBP 111.11', formattedDateReceived: 'January 1' },
        { formattedCurrencyAndAmount: 'GBP 222.22', formattedDateReceived: 'February 2' },
        { formattedCurrencyAndAmount: 'GBP 333.33', formattedDateReceived: 'March 3' },
      ];
      const keyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments,
      };
      const wrapper = getWrapper({ keyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("GBP 111.11")').toExist();
      wrapper.expectElement('tr:eq(0) td:contains("January 1")').toExist();

      wrapper.expectElement('tr:eq(1) td:contains("GBP 222.22")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("February 2")').toExist();

      wrapper.expectElement('tr:eq(2) td:contains("GBP 333.33")').toExist();
      wrapper.expectElement('tr:eq(2) td:contains("March 3")').toExist();
    });
  });
});
