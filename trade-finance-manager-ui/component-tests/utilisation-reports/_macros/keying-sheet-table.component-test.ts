import { KeyingSheetViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/keying-sheet-table.njk';
const render = componentRenderer(component, true);

type KeyingSheetTableViewModel = {
  reportId: string;
  keyingSheet: KeyingSheetViewModel;
  userCanEdit: boolean;
};

describe(component, () => {
  const aKeyingSheetTableRowViewModel = (): KeyingSheetViewModel[number] => ({
    status: 'TO_DO',
    displayStatus: 'TO DO',
    facilityId: '12345678',
    exporter: 'Test exporter',
    formattedDatePaymentReceived: 'Some date',
    baseCurrency: 'GBP',
    feePayment: 'GBP 100.00',
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
    checkboxId: 'feeRecordId-1',
    isChecked: false,
  });

  const aKeyingSheetTableViewModel = (): KeyingSheetTableViewModel => ({
    reportId: '1',
    keyingSheet: [aKeyingSheetTableRowViewModel()],
    userCanEdit: true,
  });

  const getWrapper = (viewModel: { keyingSheet: KeyingSheetViewModel; reportId: string; userCanEdit: boolean }) => render(viewModel);

  const tableHeaderSelector = (text: string) => `thead th:contains("${text}")`;

  it('renders two table header rows', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement('thead tr').toHaveCount(2);
  });

  it('renders the status, facility id, exporter, date, fee payment and base currency table headings with a rowspan of 2', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Status')).toExist();
    wrapper.expectElement(tableHeaderSelector('Status')).toHaveAttribute('rowspan', '2');

    wrapper.expectElement(tableHeaderSelector('Facility ID')).toExist();
    wrapper.expectElement(tableHeaderSelector('Facility ID')).toHaveAttribute('rowspan', '2');

    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).toHaveAttribute('rowspan', '2');

    wrapper.expectElement(tableHeaderSelector('Date')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date')).toHaveAttribute('rowspan', '2');

    wrapper.expectElement(tableHeaderSelector('Fee payment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Fee payment')).toHaveAttribute('rowspan', '2');

    wrapper.expectElement(tableHeaderSelector('Base currency')).toExist();
    wrapper.expectElement(tableHeaderSelector('Base currency')).toHaveAttribute('rowspan', '2');
  });

  it('renders the fee payment table heading with the numeric header class', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Fee payment')).hasClass('govuk-table__header--numeric');
  });

  it('renders the fixed fee adjustment, premium accrual balance adjustment and principal balance adjustment headers with a colspan of 2', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Fixed fee adjustment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Fixed fee adjustment')).toHaveAttribute('colspan', '2');

    wrapper.expectElement(tableHeaderSelector('Premium accrual balance adjustment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Premium accrual balance adjustment')).toHaveAttribute('colspan', '2');

    wrapper.expectElement(tableHeaderSelector('Principal balance adjustment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Principal balance adjustment')).toHaveAttribute('colspan', '2');
  });

  it('renders 3 increase and decrease columns in the table headers', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Increase')).toHaveCount(3);
    wrapper.expectElement(tableHeaderSelector('Decrease')).toHaveCount(3);
  });

  it('renders the keying sheet status, facility id, exporter, date received, base currency and fee payment in the table row', () => {
    const keyingSheet: KeyingSheetViewModel = [
      {
        ...aKeyingSheetTableRowViewModel(),
        status: 'TO_DO',
        displayStatus: 'TO DO',
        facilityId: 'some facility id',
        exporter: 'some exporter',
        formattedDatePaymentReceived: 'some date received',
        baseCurrency: 'EUR',
        feePayment: 'GBP 314.59',
      },
    ];
    const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

    wrapper.expectElement(`tbody td:contains("TO DO")`).toExist();
    wrapper.expectElement(`tbody td:contains("some facility id")`).toExist();
    wrapper.expectElement(`tbody td:contains("some exporter")`).toExist();
    wrapper.expectElement(`tbody td:contains("some date received")`).toExist();
    wrapper.expectElement(`tbody td:contains("EUR")`).toExist();
    wrapper.expectElement(`tbody td:contains("GBP 314.59")`).toExist();
  });

  it('renders the fee payment with the numeric cell class in the table row', () => {
    const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), feePayment: 'GBP 314.59' }];
    const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

    wrapper.expectElement(`tbody td:contains("GBP 314.59")`).toExist();
    wrapper.expectElement(`tbody td:contains("GBP 314.59")`).hasClass('govuk-table__cell--numeric');
  });

  it('renders the keying sheet adjustment increase and decrease columns', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement('tbody td[data-cy="keying-sheet-adjustment--increase"]').toHaveCount(3);
    wrapper.expectElement('tbody td[data-cy="keying-sheet-adjustment--decrease"]').toHaveCount(3);
  });

  describe('when the keying sheet adjustment value change field is set to INCREASE', () => {
    const change = 'INCREASE';

    const increaseColumnSelector = 'tbody td[data-cy="keying-sheet-adjustment--increase"]';

    it('renders the fixed fee adjustment amount in the increase column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), fixedFeeAdjustment: { change, amount: '111.11' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${increaseColumnSelector}:contains("111.11")`).toExist();
    });

    it('renders the premium accrual balance adjustment in the increase column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), premiumAccrualBalanceAdjustment: { change, amount: '222.22' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${increaseColumnSelector}:contains("222.22")`).toExist();
    });

    it('renders the principal balance adjustment in the increase column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), principalBalanceAdjustment: { change, amount: '333.33' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${increaseColumnSelector}:contains("333.33")`).toExist();
    });

    it("sets all the decrease columns to the '-' character", () => {
      const keyingSheet: KeyingSheetViewModel = [
        {
          ...aKeyingSheetTableRowViewModel(),
          fixedFeeAdjustment: { change, amount: '111.11' },
          premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
          principalBalanceAdjustment: { change, amount: '333.33' },
        },
      ];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`tbody td[data-cy="keying-sheet-adjustment--decrease"]:contains("-")`).toHaveCount(3);
    });
  });

  describe('when the keying sheet adjustment value change field is set to DECREASE', () => {
    const change = 'DECREASE';

    const decreaseColumnSelector = 'tbody td[data-cy="keying-sheet-adjustment--decrease"]';

    it('renders the fixed fee adjustment amount in the decrease column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), fixedFeeAdjustment: { change, amount: '111.11' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("111.11")`).toExist();
    });

    it('renders the premium accrual balance adjustment in the decrease column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), premiumAccrualBalanceAdjustment: { change, amount: '222.22' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("222.22")`).toExist();
    });

    it('renders the principal balance adjustment in the decrease column', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), principalBalanceAdjustment: { change, amount: '333.33' } }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`${decreaseColumnSelector}:contains("333.33")`).toExist();
    });

    it("sets all the increase columns to the '-' character", () => {
      const keyingSheet: KeyingSheetViewModel = [
        {
          ...aKeyingSheetTableRowViewModel(),
          fixedFeeAdjustment: { change, amount: '111.11' },
          premiumAccrualBalanceAdjustment: { change, amount: '222.22' },
          principalBalanceAdjustment: { change, amount: '333.33' },
        },
      ];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet });

      wrapper.expectElement(`tbody td[data-cy="keying-sheet-adjustment--increase"]:contains("-")`).toHaveCount(3);
    });
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it('renders the select all checkbox table header with a rowspan of 2', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').toExist();
      wrapper.expectElement('thead th:has(input#select-all-checkbox)').toHaveAttribute('rowspan', '2');
    });

    it('renders the select fee record checkbox in each table body row with the supplied id', () => {
      const keyingSheet: KeyingSheetViewModel = [
        { ...aKeyingSheetTableRowViewModel(), checkboxId: 'feeRecordId-1' },
        { ...aKeyingSheetTableRowViewModel(), checkboxId: 'feeRecordId-2' },
      ];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit, keyingSheet });

      wrapper.expectElement('tbody tr').toHaveCount(2);
      wrapper.expectElement('tbody input[type="checkbox"]').toHaveCount(2);
      wrapper.expectElement('tbody input[type="checkbox"]#feeRecordId-1').toExist();
      wrapper.expectElement('tbody input[type="checkbox"]#feeRecordId-2').toExist();
    });

    it('renders the select fee record checkbox as checked when isChecked is set to true', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), isChecked: true }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit, keyingSheet });

      wrapper.expectElement('tbody tr').toHaveCount(1);
      wrapper.expectElement('tbody input[type="checkbox"]').toHaveCount(1);
      wrapper.expectInput('tbody input[type="checkbox"]').toBeChecked();
    });

    it('renders the select fee record checkbox as checked when isChecked is set to true', () => {
      const keyingSheet: KeyingSheetViewModel = [{ ...aKeyingSheetTableRowViewModel(), isChecked: false }];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit, keyingSheet });

      wrapper.expectElement('tbody tr').toHaveCount(1);
      wrapper.expectElement('tbody input[type="checkbox"]').toHaveCount(1);
      wrapper.expectInput('tbody input[type="checkbox"]').notToBeChecked();
    });
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it('does not render the select all checkbox table header with a rowspan of 2', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').notToExist();
    });

    it('does not render the select fee record checkbox', () => {
      const keyingSheet: KeyingSheetViewModel = [
        { ...aKeyingSheetTableRowViewModel(), checkboxId: 'feeRecordId-1' },
        { ...aKeyingSheetTableRowViewModel(), checkboxId: 'feeRecordId-2' },
      ];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit, keyingSheet });

      wrapper.expectElement('tbody tr').toHaveCount(2);
      wrapper.expectElement('tbody input[type="checkbox"]').notToExist();
    });
  });
});
