const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/check-keying-data-table-row.njk';

const renderTableContainer = true;
const render = componentRenderer(component, renderTableContainer);

describe(component, () => {
  const aFeeRecordToKey = () => ({
    id: 1,
    facilityId: '12345678',
    exporter: 'Test exporter 1',
    reportedFees: {
      formattedCurrencyAndAmount: 'EUR 100.00',
      dataSortValue: 0,
    },
    reportedPayments: {
      formattedCurrencyAndAmount: 'GBP 90.91',
      dataSortValue: 0,
    },
    paymentsReceived: ['GBP 90.91'],
    status: FEE_RECORD_STATUS.MATCH,
    displayStatus: 'MATCH',
  });

  const getRowSelector = (feeRecordId) => `tr[data-cy="check-keying-data-table-row--feeRecordId-${feeRecordId}"]`;

  const govukNumericCellClassName = 'govuk-table__cell--numeric';

  it('creates a single table row', () => {
    // Arrange
    const feeRecord = { ...aFeeRecordToKey(), id: 1 };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    wrapper.expectElement(getRowSelector(1)).toHaveCount(1);
  });

  it('renders the facility id', () => {
    // Arrange
    const feeRecord = { ...aFeeRecordToKey(), id: 1, facilityId: '12345678' };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    wrapper.expectElement(`${getRowSelector(1)} th:contains("12345678")`).toExist();
  });

  it('renders the exporter', () => {
    // Arrange
    const feeRecord = { ...aFeeRecordToKey(), id: 1, exporter: 'Test exporter' };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    wrapper.expectElement(`${getRowSelector(1)} td:contains("Test exporter")`).toExist();
  });

  it('renders the reported fees using the numeric cell class with the data sort value attribute', () => {
    // Arrange
    const feeRecord = {
      ...aFeeRecordToKey(),
      id: 1,
      reportedFees: {
        formattedCurrencyAndAmount: 'JPY 100.00',
        dataSortValue: 5,
      },
    };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    const rowSelector = getRowSelector(1);
    wrapper.expectElement(`${rowSelector} td:contains("JPY 100.00")`).toExist();
    wrapper.expectElement(`${rowSelector} td:contains("JPY 100.00")`).hasClass(govukNumericCellClassName);
    wrapper.expectElement(`${rowSelector} td:contains("JPY 100.00")`).toHaveAttribute('data-sort-value', '5');
  });

  it('renders the reported payment using the numeric cell class with the data sort value attribute', () => {
    // Arrange
    const feeRecord = {
      ...aFeeRecordToKey(),
      id: 1,
      reportedPayments: {
        formattedCurrencyAndAmount: 'USD 100.00',
        dataSortValue: 3,
      },
    };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    const rowSelector = getRowSelector(1);
    wrapper.expectElement(`${rowSelector} td:contains("USD 100.00")`).toExist();
    wrapper.expectElement(`${rowSelector} td:contains("USD 100.00")`).hasClass(govukNumericCellClassName);
    wrapper.expectElement(`${rowSelector} td:contains("USD 100.00")`).toHaveAttribute('data-sort-value', '3');
  });

  it('renders the payments received with the numeric cell class when there is only one payment received', () => {
    // Arrange
    const feeRecord = {
      ...aFeeRecordToKey(),
      id: 1,
      paymentsReceived: ['GBP 90.91'],
    };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    const rowSelector = getRowSelector(1);
    wrapper.expectElement(`${rowSelector} td:contains("GBP 90.91")`).toExist();
    wrapper.expectElement(`${rowSelector} td:contains("GBP 90.91")`).hasClass(govukNumericCellClassName);
    wrapper.expectElement(`${rowSelector} td:has(ul)`).notToExist();
  });

  it('renders a list item for each payment received with the numeric cell class when there are multiple payments received', () => {
    // Arrange
    const feeRecord = {
      ...aFeeRecordToKey(),
      id: 1,
      paymentsReceived: ['GBP 90.91', 'GBP 50.10', 'GBP 314.59'],
    };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    const rowSelector = getRowSelector(1);
    wrapper.expectElement(`${rowSelector} td:has(ul.payments-list)`).toExist();
    wrapper.expectElement(`${rowSelector} td:has(ul.payments-list)`).hasClass(govukNumericCellClassName);

    wrapper.expectElement(`${rowSelector} ul.payments-list li`).toHaveCount(3);
    wrapper.expectElement(`${rowSelector} li:contains("GBP 90.91")`).toExist();
    wrapper.expectElement(`${rowSelector} li:contains("GBP 50.10")`).toExist();
    wrapper.expectElement(`${rowSelector} li:contains("GBP 314.59")`).toExist();
  });

  it('renders the display status badge', () => {
    // Arrange
    const feeRecord = {
      ...aFeeRecordToKey(),
      id: 1,
      displayStatus: 'MATCH',
    };

    // Act
    const wrapper = render({ feeRecord });

    // Assert
    wrapper.expectElement(`${getRowSelector(1)} td:contains("MATCH")`).toExist();
  });
});
