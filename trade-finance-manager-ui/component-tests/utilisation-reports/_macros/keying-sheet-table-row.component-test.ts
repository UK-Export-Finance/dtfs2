import { CurrencyAndAmountString } from '@ukef/dtfs2-common';
import { KeyingSheetViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/keying-sheet-table-row.njk';
const render = componentRenderer(component, true);

type KeyingSheetTableRow = KeyingSheetViewModel[number];

describe(component, () => {
  const aKeyingSheetTableRow = (): KeyingSheetTableRow => ({
    status: 'TO_DO',
    displayStatus: 'TO DO',
    facilityId: '12345678',
    exporter: 'Test exporter',
    baseCurrency: 'GBP',
    feePayments: [
      {
        formattedCurrencyAndAmount: 'GBP 100.00',
        formattedDateReceived: 'Some date',
      },
    ],
    fixedFeeAdjustment: {
      amount: '100',
      change: 'INCREASE',
    },
    premiumAccrualBalanceAdjustment: {
      amount: '100',
      change: 'INCREASE',
    },
    principalBalanceAdjustment: {
      amount: '100',
      change: 'INCREASE',
    },
    checkboxId: 'feeRecordId-1-status-TO_DO',
    isChecked: false,
  });

  const getWrapper = ({ KeyingSheetRow, userCanEdit }: { KeyingSheetRow?: KeyingSheetTableRow; userCanEdit?: boolean } = {}) =>
    render({ KeyingSheetRow: KeyingSheetRow ?? aKeyingSheetTableRow(), userCanEdit: userCanEdit ?? true });

  it('renders the keying sheet status, facility id, exporter, base currency and fee payment in the table row', () => {
    const KeyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      status: 'TO_DO',
      displayStatus: 'TO DO',
      facilityId: 'some facility id',
      exporter: 'some exporter',
      baseCurrency: 'EUR',
    };
    const wrapper = getWrapper({ KeyingSheetRow });

    wrapper.expectElement(`tr td:contains("TO DO")`).toExist();
    wrapper.expectElement(`tr td:contains("some facility id")`).toExist();
    wrapper.expectElement(`tr td:contains("some exporter")`).toExist();
    wrapper.expectElement(`tr td:contains("EUR")`).toExist();
  });

  it('renders the fee payment column with the numeric cell class and date received column', () => {
    const KeyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      feePayments: [
        {
          formattedCurrencyAndAmount: 'GBP 111.11',
          formattedDateReceived: 'Some date',
        },
      ],
    };
    const wrapper = getWrapper({ KeyingSheetRow });

    wrapper.expectElement('tr td:contains("GBP 111.11")').toExist();
    wrapper.expectElement('tr td:contains("GBP 111.11")').hasClass('govuk-table__cell--numeric');
    wrapper.expectElement('tr td:contains("Some date")').toExist();
  });

  it('renders the keying sheet adjustment increase and decrease columns', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('tr td[data-cy="keying-sheet-adjustment--increase"]').toHaveCount(3);
    wrapper.expectElement('tr td[data-cy="keying-sheet-adjustment--decrease"]').toHaveCount(3);
  });

  it("renders the '-' in all the increase and decrease adjustment cells when the adjustment change is 'NONE'", () => {
    const change = 'NONE';
    const KeyingSheetRow: KeyingSheetTableRow = {
      ...aKeyingSheetTableRow(),
      fixedFeeAdjustment: { change, amount: '111.11' },
      premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
      principalBalanceAdjustment: { change, amount: '333.33' },
    };
    const wrapper = getWrapper({ KeyingSheetRow });

    wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--increase"]:contains("-")`).toHaveCount(3);
    wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--decrease"]:contains("-")`).toHaveCount(3);
    wrapper.expectElement('tr td:contains("111.11")').notToExist();
    wrapper.expectElement('tr td:contains("222.22")').notToExist();
    wrapper.expectElement('tr td:contains("333.33")').notToExist();
  });

  describe('when the keying sheet adjustment value change field is set to INCREASE', () => {
    const change = 'INCREASE';

    const increaseColumnSelector = 'tr td[data-cy="keying-sheet-adjustment--increase"]';

    it('renders the fixed fee adjustment amount in the increase column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        fixedFeeAdjustment: { change, amount: '111.11' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${increaseColumnSelector}:contains("111.11")`).toExist();
      wrapper.expectElement(`${increaseColumnSelector}:contains("111.11")`).hasClass('govuk-table__cell--numeric');
    });

    it('renders the premium accrual balance adjustment in the increase column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${increaseColumnSelector}:contains("222.22")`).toExist();
      wrapper.expectElement(`${increaseColumnSelector}:contains("222.22")`).hasClass('govuk-table__cell--numeric');
    });

    it('renders the principal balance adjustment in the increase column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        principalBalanceAdjustment: { change, amount: '333.33' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${increaseColumnSelector}:contains("333.33")`).toExist();
      wrapper.expectElement(`${increaseColumnSelector}:contains("333.33")`).hasClass('govuk-table__cell--numeric');
    });

    it("sets all the decrease columns to the '-' character and does not use the numeric cell class", () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        fixedFeeAdjustment: { change, amount: '111.11' },
        premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
        principalBalanceAdjustment: { change, amount: '333.33' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--decrease"]:contains("-")`).toHaveCount(3);
      wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--decrease"]:contains("-")`).doesNotHaveClass('govuk-table__cell--numeric');
    });
  });

  describe('when the keying sheet adjustment value change field is set to DECREASE', () => {
    const change = 'DECREASE';

    const decreaseColumnSelector = 'tr td[data-cy="keying-sheet-adjustment--decrease"]';

    it('renders the fixed fee adjustment amount in the decrease column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        fixedFeeAdjustment: { change, amount: '111.11' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("111.11")`).toExist();
      wrapper.expectElement(`${decreaseColumnSelector}:contains("111.11")`).hasClass('govuk-table__cell--numeric');
    });

    it('renders the premium accrual balance adjustment in the decrease column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("222.22")`).toExist();
      wrapper.expectElement(`${decreaseColumnSelector}:contains("222.22")`).hasClass('govuk-table__cell--numeric');
    });

    it('renders the principal balance adjustment in the decrease column with the numeric cell class', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        principalBalanceAdjustment: { change, amount: '333.33' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("333.33")`).toExist();
      wrapper.expectElement(`${decreaseColumnSelector}:contains("333.33")`).hasClass('govuk-table__cell--numeric');
    });

    it("sets all the increase columns to the '-' character and does not use the numeric cell class", () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        fixedFeeAdjustment: { change, amount: '111.11' },
        premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
        principalBalanceAdjustment: { change, amount: '333.33' },
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--increase"]:contains("-")`).toHaveCount(3);
      wrapper.expectElement(`tr td[data-cy="keying-sheet-adjustment--increase"]:contains("-")`).doesNotHaveClass('govuk-table__cell--numeric');
    });
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it('renders the select fee record checkbox with the supplied checkbox id', () => {
      const KeyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), checkboxId: 'feeRecordId-123-status-DONE' };
      const wrapper = getWrapper({ userCanEdit, KeyingSheetRow });

      wrapper.expectElement('tr input[type="checkbox"]#feeRecordId-123-status-DONE').toExist();
    });

    it('renders the select fee record checkbox as checked when isChecked is set to true', () => {
      const KeyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), isChecked: true };
      const wrapper = getWrapper({ userCanEdit, KeyingSheetRow });

      wrapper.expectElement('tr input[type="checkbox"]').toHaveCount(1);
      wrapper.expectInput('tr input[type="checkbox"]').toBeChecked();
    });

    it('renders the select fee record checkbox as not checked when isChecked is set to false', () => {
      const KeyingSheetRow: KeyingSheetTableRow = { ...aKeyingSheetTableRow(), isChecked: false };
      const wrapper = getWrapper({ userCanEdit, KeyingSheetRow });

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
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);
    });

    it('renders the none-fee payment keying sheet data and checkbox only in the first row', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        status: 'TO_DO',
        displayStatus: 'TO DO',
        baseCurrency: 'EUR',
        checkboxId: 'feeRecordId-123-status-TO_DO',
        fixedFeeAdjustment: { change: 'NONE', amount: '0' },
        premiumAccrualBalanceAdjustment: { change: 'NONE', amount: '0' },
        principalBalanceAdjustment: { change: 'NONE', amount: '0' },
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("TO DO")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("TO DO")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("TO DO")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("12345678")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("12345678")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("12345678")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("Test exporter 1")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("Test exporter 1")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("Test exporter 1")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("EUR")').toExist();
      wrapper.expectElement('tr:eq(1) td:contains("EUR")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("EUR")').notToExist();

      wrapper.expectElement('tr:eq(0) td:contains("-")').toHaveCount(6);
      wrapper.expectElement('tr:eq(1) td:contains("-")').notToExist();
      wrapper.expectElement('tr:eq(2) td:contains("-")').notToExist();

      wrapper.expectElement('tr:eq(0) td:has(input[type="checkbox"])').toExist();
      wrapper.expectElement('tr:eq(1) td:has(input[type="checkbox"])').notToExist();
      wrapper.expectElement('tr:eq(2) td:has(input[type="checkbox"])').notToExist();
    });

    it('sets the data sort value for each row to match the value in the first row for the status, facility id and exporter', () => {
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        status: 'TO_DO',
        displayStatus: 'TO DO',
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement('tr').toHaveCount(3);

      wrapper.expectElement('tr:eq(0) td:contains("TO DO")').toHaveAttribute('data-sort-value', 'TO_DO');
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
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments: [aFeePayment(), aFeePayment(), aFeePayment()],
      };
      const wrapper = getWrapper({ KeyingSheetRow });

      wrapper.expectElement('tr:eq(0) td.no-border').toHaveCount(13);
      wrapper.expectElement('tr:eq(1) td.no-border').toHaveCount(13);
      wrapper.expectElement('tr:eq(2) td.no-border').notToExist();
    });

    it('renders each of the fee payments listed in the supplied array', () => {
      const feePayments: { formattedCurrencyAndAmount: CurrencyAndAmountString; formattedDateReceived: string }[] = [
        { formattedCurrencyAndAmount: 'GBP 111.11', formattedDateReceived: 'January 1' },
        { formattedCurrencyAndAmount: 'GBP 222.22', formattedDateReceived: 'February 2' },
        { formattedCurrencyAndAmount: 'GBP 333.33', formattedDateReceived: 'March 3' },
      ];
      const KeyingSheetRow: KeyingSheetTableRow = {
        ...aKeyingSheetTableRow(),
        feePayments,
      };
      const wrapper = getWrapper({ KeyingSheetRow });

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
