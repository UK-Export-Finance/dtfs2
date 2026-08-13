import { CURRENCY } from '@ukef/dtfs2-common';
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
        displayStatus: 'To do',
        facilityId: '12345678',
        feeRecordId: 12,
        exporter: 'Test exporter',
        baseCurrency: CURRENCY.GBP,
        feePayments: [
          {
            formattedCurrencyAndAmount: 'GBP 100.00',
            formattedDateReceived: 'January 1',
          },
        ],
        checkboxId: 'feeRecordId-1-status-TO_DO',
        isChecked: false,
      },
    ],
    userCanEdit: true,
  });

  const getWrapper = (viewModel: { keyingSheet: KeyingSheetViewModel; reportId: string; userCanEdit: boolean }) => render(viewModel);

  const tableHeaderSelector = (text: string) => `thead th:contains("${text}")`;

  it('should render the status, facility id, exporter, date, fee payment and base currency table headings', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Status')).toExist();
    wrapper.expectElement(tableHeaderSelector('Facility ID')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date')).toExist();
    wrapper.expectElement(tableHeaderSelector('Fee payment')).toExist();
    wrapper.expectElement(tableHeaderSelector('Base currency')).toExist();
  });

  it('renders the fee payment table heading with the numeric header class', () => {
    const wrapper = getWrapper(aKeyingSheetTableViewModel());

    wrapper.expectElement(tableHeaderSelector('Fee payment')).hasClass('govuk-table__header--numeric');
  });

  describe('when userCanEdit is set to true', () => {
    const userCanEdit = true;

    it('should render the select all checkbox table header', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').toExist();
    });

    it('should render a unique accessible label for each fee record checkbox', () => {
      const firstKeyingSheetRow = aKeyingSheetTableViewModel().keyingSheet[0];
      const keyingSheet: KeyingSheetViewModel = [
        firstKeyingSheetRow,
        {
          ...firstKeyingSheetRow,
          facilityId: '87654321',
          feeRecordId: 13,
          exporter: 'Another exporter',
          checkboxId: 'feeRecordId-2-status-TO_DO',
        },
      ];
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), keyingSheet, userCanEdit });

      wrapper.expectElement('tbody tr').toHaveCount(2);
      wrapper
        .expectElement('tbody input#feeRecordId-1-status-TO_DO')
        .toHaveAttribute('aria-label', 'Select 12345678 with exporter Test exporter to mark as done or to mark as to do');
      wrapper
        .expectElement('tbody input#feeRecordId-2-status-TO_DO')
        .toHaveAttribute('aria-label', 'Select 87654321 with exporter Another exporter to mark as done or to mark as to do');
    });
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it('should not render the select all checkbox table header', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').notToExist();
    });
  });
});
