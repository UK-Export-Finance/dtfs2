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

  it('renders the status, facility id, exporter, date, fee payment and base currency table headings', () => {
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

    it('renders the select all checkbox table header', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').toExist();
    });
  });

  describe('when userCanEdit is set to false', () => {
    const userCanEdit = false;

    it('does not render the select all checkbox table header', () => {
      const wrapper = getWrapper({ ...aKeyingSheetTableViewModel(), userCanEdit });

      wrapper.expectElement('thead input#select-all-checkbox').notToExist();
    });
  });
});
