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
  const aKeyingSheetTableViewModel = (): KeyingSheetTableViewModel => ({
    reportId: '1',
    keyingSheet: [
      {
        status: 'TO_DO',
        displayStatus: 'TO DO',
        facilityId: '12345678',
        feeRecordId: 12,
        exporter: 'Test exporter',
        baseCurrency: 'GBP',
        feePayments: [
          {
            formattedCurrencyAndAmount: 'GBP 100.00',
            formattedDateReceived: 'January 1',
          },
        ],
        fixedFeeAdjustment: {
          amount: '100',
          change: 'INCREASE',
        },
        principalBalanceAdjustment: {
          amount: '100',
          change: 'INCREASE',
        },
        checkboxId: 'feeRecordId-1-status-TO_DO',
        isChecked: false,
      },
    ],
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

  it('renders the fixed fee adjustment and principal balance adjustment headers with a colspan of 2', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Fixed fee adjustment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Fixed fee adjustment')).toHaveAttribute('colspan', '2');

    wrapper.expectElement(tableHeaderSelector('Principal balance adjustment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Principal balance adjustment')).toHaveAttribute('colspan', '2');
  });

  it('renders 2 increase and 2 decrease columns in the table headers', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Increase')).toHaveCount(2);
    wrapper.expectElement(tableHeaderSelector('Decrease')).toHaveCount(2);
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it('renders the select all checkbox table header with a rowspan of 2', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').toExist();
      wrapper.expectElement('thead td:has(input#select-all-checkbox)').toHaveAttribute('rowspan', '2');
    });
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it('does not render the select all checkbox table header with a rowspan of 2', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').notToExist();
    });
  });
});
