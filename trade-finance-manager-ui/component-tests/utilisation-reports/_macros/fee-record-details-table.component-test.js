const { RECONCILIATION_FOR_REPORT_TABS } = require('../../../server/constants/reconciliation-for-report-tabs');
const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/fee-record-details-table.njk';

const renderTableContainer = true;
const render = componentRenderer(component, renderTableContainer);

describe(component, () => {
  /**
   * @returns {import('../../../server/types/view-models').FeeRecordDetailsViewModel}
   */
  const aFeeRecordDetailsViewModel = () => [
    {
      id: 1,
      facilityId: '12345678',
      exporter: 'Test exporter',
      reportedFees: {
        formattedCurrencyAndAmount: 'GBP 100.00',
        dataSortValue: 0,
      },
      reportedPayments: {
        formattedCurrencyAndAmount: 'GBP 100.00',
        dataSortValue: 0,
      },
      checkboxId: 'feeRecordId-1',
      isChecked: false,
    },
  ];

  const reportId = '7';
  const paymentId = '77';

  const getWrapper = ({ captionText, feeRecords, totalReportedPayments, enableSelectingFeeRecords, errorMessage, overrides, redirectTab } = {}) =>
    render({
      reportId,
      paymentId,
      captionText: captionText ?? 'Some caption',
      feeRecords: feeRecords ?? aFeeRecordDetailsViewModel(),
      totalReportedPayments: totalReportedPayments ?? 'GBP 100.00',
      enableSelectingFeeRecords: enableSelectingFeeRecords ?? true,
      errorMessage,
      overrides: overrides ?? {},
      redirectTab,
    });

  const tableSelector = 'table[data-cy="fee-record-details-table"]';
  const getRowSelector = (feeRecordId) => `tbody tr[data-cy="fee-record-details-table-row--feeRecordId-${feeRecordId}"]`;
  const totalReportedPaymentsRowSelector = 'tfoot tr[data-cy="fee-record-details-table-row--totalReportedPayments"]';

  it('renders the table caption', () => {
    const wrapper = getWrapper({ captionText: 'My table' });

    wrapper.expectElement(`${tableSelector} caption:contains("My table")`).toExist();
  });

  it('renders the Facility ID table header with aria-sort set to ascending', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toHaveAttribute('aria-sort', 'ascending');
  });

  it('renders the Exporter table header with aria-sort set to none', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toHaveAttribute('aria-sort', 'none');
  });

  it('renders the Reported fees table header with aria-sort set to none and the numeric table header class', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).hasClass('govuk-table__header--numeric');
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toHaveAttribute('aria-sort', 'none');
  });

  it('renders the Reported fees table header with the override text when the overrides.reportedFeesHeader is defined', () => {
    const wrapper = getWrapper({ overrides: { reportedFeesHeader: 'Some other header' } });

    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).notToExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Some other header")`).toExist();
  });

  it('renders the Reported payments table header with aria-sort set to none and the numeric table header class', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).hasClass('govuk-table__header--numeric');
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toHaveAttribute('aria-sort', 'none');
  });

  it('renders an empty table header when enableSelectingFeeRecords is set to true', () => {
    const wrapper = getWrapper({ enableSelectingFeeRecords: true });

    wrapper.expectElement(`${tableSelector} thead th:is(:empty)`).toExist();
  });

  it('does not render an empty table header when enableSelectingFeeRecords is set to false', () => {
    const wrapper = getWrapper({ enableSelectingFeeRecords: false });

    wrapper.expectElement(`${tableSelector} thead th:is(:empty)`).notToExist();
  });

  it('renders a table row for each item in the feeRecords array', () => {
    const feeRecords = [
      { ...aFeeRecordDetailsViewModel(), id: 1 },
      { ...aFeeRecordDetailsViewModel(), id: 2 },
      { ...aFeeRecordDetailsViewModel(), id: 3 },
    ];
    const wrapper = getWrapper({ feeRecords });

    wrapper.expectElement(`${tableSelector} tbody tr`).toHaveCount(feeRecords.length);
    feeRecords.forEach(({ id }) => {
      wrapper.expectElement(getRowSelector(id)).toExist();
    });
  });

  it('renders the fee record facility id', () => {
    const feeRecords = [
      { ...aFeeRecordDetailsViewModel(), id: 1, facilityId: '12345678' },
      { ...aFeeRecordDetailsViewModel(), id: 2, facilityId: '87654321' },
    ];
    const wrapper = getWrapper({ feeRecords });

    feeRecords.forEach(({ id, facilityId }) => {
      wrapper.expectElement(`${getRowSelector(id)} th:contains("${facilityId}")`).toExist();
    });
  });

  it('renders the fee record exporter', () => {
    const feeRecords = [
      { ...aFeeRecordDetailsViewModel(), id: 1, exporter: 'Test exporter 1' },
      { ...aFeeRecordDetailsViewModel(), id: 2, exporter: 'Test exporter 2' },
    ];
    const wrapper = getWrapper({ feeRecords });

    feeRecords.forEach(({ id, exporter }) => {
      wrapper.expectElement(`${getRowSelector(id)} td:contains("${exporter}")`).toExist();
    });
  });

  it('renders the fee record reported fees with the data-sort-value attribute and numeric cell class', () => {
    const feeRecords = [
      {
        ...aFeeRecordDetailsViewModel(),
        id: 1,
        reportedFees: {
          formattedCurrencyAndAmount: 'GBP 100.00',
          dataSortValue: 0,
        },
      },
      {
        ...aFeeRecordDetailsViewModel(),
        id: 1,
        reportedFees: {
          formattedCurrencyAndAmount: 'GBP 200.00',
          dataSortValue: 1,
        },
      },
    ];
    const wrapper = getWrapper({ feeRecords });

    feeRecords.forEach(({ id, reportedFees }) => {
      wrapper.expectElement(`${getRowSelector(id)} td:contains("${reportedFees.formattedCurrencyAndAmount}")`).toExist();
      wrapper
        .expectElement(`${getRowSelector(id)} td:contains("${reportedFees.formattedCurrencyAndAmount}")`)
        .toHaveAttribute('data-sort-value', reportedFees.dataSortValue.toString());
      wrapper.expectElement(`${getRowSelector(id)} td:contains("${reportedFees.formattedCurrencyAndAmount}")`).hasClass('govuk-table__cell--numeric');
    });
  });

  it('renders the fee record reported payments with the data-sort-value attribute and numeric cell class', () => {
    const feeRecords = [
      {
        ...aFeeRecordDetailsViewModel(),
        id: 1,
        reportedPayments: {
          formattedCurrencyAndAmount: 'GBP 100.00',
          dataSortValue: 0,
        },
      },
      {
        ...aFeeRecordDetailsViewModel(),
        id: 1,
        reportedPayments: {
          formattedCurrencyAndAmount: 'GBP 200.00',
          dataSortValue: 1,
        },
      },
    ];
    const wrapper = getWrapper({ feeRecords });

    feeRecords.forEach(({ id, reportedPayments }) => {
      wrapper.expectElement(`${getRowSelector(id)} td:contains("${reportedPayments.formattedCurrencyAndAmount}")`).toExist();
      wrapper
        .expectElement(`${getRowSelector(id)} td:contains("${reportedPayments.formattedCurrencyAndAmount}")`)
        .toHaveAttribute('data-sort-value', reportedPayments.dataSortValue.toString());
      wrapper.expectElement(`${getRowSelector(id)} td:contains("${reportedPayments.formattedCurrencyAndAmount}")`).hasClass('govuk-table__cell--numeric');
    });
  });

  it('renders the fee record checkbox with the supplied checkbox id when enableSelectingFeeRecords is set to true', () => {
    const feeRecords = [
      { ...aFeeRecordDetailsViewModel(), id: 1, checkboxId: 'first-checkbox-id' },
      { ...aFeeRecordDetailsViewModel(), id: 2, checkboxId: 'second-checkbox-id' },
    ];
    const wrapper = getWrapper({ feeRecords, enableSelectingFeeRecords: true });

    feeRecords.forEach(({ id, checkboxId }) => {
      wrapper.expectElement(`${getRowSelector(id)} td input#${checkboxId}`).toExist();
    });
  });

  it('renders the fee record checkbox in the checked state when isChecked is true when enableSelectingFeeRecords is set to true', () => {
    const feeRecord = { ...aFeeRecordDetailsViewModel(), id: 1, checkboxId: 'checkboxId', isChecked: true };
    const wrapper = getWrapper({ feeRecords: [feeRecord], enableSelectingFeeRecords: true });

    wrapper.expectElement(`${getRowSelector(feeRecord.id)} td input#${feeRecord.checkboxId}`).toHaveAttribute('checked', 'checked');
  });

  it('renders the fee record checkbox in the unchecked state when isChecked is false when enableSelectingFeeRecords is set to true', () => {
    const feeRecord = { ...aFeeRecordDetailsViewModel(), id: 1, checkboxId: 'checkboxId', isChecked: false };
    const wrapper = getWrapper({ feeRecords: [feeRecord], enableSelectingFeeRecords: true });

    wrapper.expectElement(`${getRowSelector(feeRecord.id)} td input#${feeRecord.checkboxId}`).toHaveAttribute('checked', undefined);
  });

  it('does not render the fee record checkbox when enableSelectingFeeRecords is set to false', () => {
    const feeRecord = { ...aFeeRecordDetailsViewModel(), id: 1, checkboxId: 'checkboxId', isChecked: true };
    const wrapper = getWrapper({ feeRecords: [feeRecord], enableSelectingFeeRecords: false });

    wrapper.expectElement(`${getRowSelector(feeRecord.id)} td input#${feeRecord.checkboxId}`).notToExist();
  });

  it('renders the table row to display the total reported payments with a colspan and numeric cell class', () => {
    const wrapper = getWrapper({ totalReportedPayments: 'EUR 100.00' });

    wrapper.expectElement(`${totalReportedPaymentsRowSelector}`).toExist();
    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td:contains("Total reported payments")`).toExist();
    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td:contains("Total reported payments")`).hasClass('govuk-table__cell--numeric');
    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td:contains("Total reported payments")`).toHaveAttribute('colspan', '4');
    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td span:contains("EUR 100.00")`).toExist();
  });

  it('renders an empty cell in the total reported payments row when enableSelectingFeeRecords is set to true', () => {
    const wrapper = getWrapper({ enableSelectingFeeRecords: true });

    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td:is(:empty)`).toExist();
  });

  it('does not render an empty cell in the total reported payments row when enableSelectingFeeRecords is set to false', () => {
    const wrapper = getWrapper({ enableSelectingFeeRecords: false });

    wrapper.expectElement(`${totalReportedPaymentsRowSelector} td:is(:empty)`).notToExist();
  });

  it('renders the "remove selected fees" button when enableSelectingFeeRecords is set to true', async () => {
    const redirectTab = RECONCILIATION_FOR_REPORT_TABS.PAYMENT_DETAILS;
    const wrapper = getWrapper({
      enableSelectingFeeRecords: true,
      redirectTab,
    });

    const saveChangesButtonSelector = 'input[data-cy="remove-selected-fees-button"]';
    wrapper.expectElement(saveChangesButtonSelector).toExist();
    wrapper.expectInput(saveChangesButtonSelector).toHaveValue('Remove selected fees');
    wrapper
      .expectElement(saveChangesButtonSelector)
      .toHaveAttribute('formaction', `/utilisation-reports/${reportId}/edit-payment/${paymentId}/remove-selected-fees?redirectTab=${redirectTab}`);
  });

  it('does not render the "remove selected fees" button when enableSelectingFeeRecords is set to false', async () => {
    const wrapper = getWrapper({ enableSelectingFeeRecords: false });

    wrapper.expectElement(`[data-cy="remove-selected-fees-button"]`).notToExist();
  });

  it('does not render an error message if not provided', async () => {
    const wrapper = getWrapper({ errorMessage: undefined });

    wrapper.expectText('caption').notToContain('Error');
  });

  it('renders the provided error message', async () => {
    const wrapper = getWrapper({ errorMessage: 'Whoops' });

    wrapper.expectText('caption').toContain('Error: Whoops');
  });

  it('does not apply error styling wrapper if no error message is provided', async () => {
    const wrapper = getWrapper({ errorMessage: undefined });

    wrapper.expectElement('div[data-cy="fee-record-details-error-wrapper"]').notToExist();
  });

  it('applies error styling wrapper if error message is provided', async () => {
    const wrapper = getWrapper({ errorMessage: 'Whoops' });

    wrapper.expectElement('div[data-cy="fee-record-details-error-wrapper"]').toExist();
    wrapper.expectElement('div[data-cy="fee-record-details-error-wrapper"]').hasClass('govuk-form-group--error');
  });
});
