const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/check-keying-data-table-row.njk';

const renderTableContainer = true;
const render = componentRenderer(component, renderTableContainer);

describe(component, () => {
  const FEE_RECORD_PAYMENT_GROUP = {
    feeRecords: [
      {
        id: 1,
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        reportedFees: 'EUR 100.00',
        reportedPayments: 'GBP 90.91',
      },
      {
        id: 2,
        facilityId: '87654321',
        exporter: 'Test exporter 2',
        reportedFees: 'USD 500.00',
        reportedPayments: 'USD 500.00',
      },
    ],
    paymentsReceived: [{ formattedCurrencyAndAmount: 'GBP 90.91' }, { formattedCurrencyAndAmount: 'USD 500.00' }],
    status: FEE_RECORD_STATUS.MATCH,
    displayStatus: 'MATCH',
  };

  const getWrapper = () => render({ feeRecordPaymentGroup: FEE_RECORD_PAYMENT_GROUP });

  const firstRowSelector = 'tr[data-cy="check-keying-data-table-row--feeRecordId-1"]';
  const secondRowSelector = 'tr[data-cy="check-keying-data-table-row--feeRecordId-2"]';

  const govukNumericCellClassName = 'govuk-table__cell--numeric';

  it('creates a table row for each fee record in the fee record payment group', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(firstRowSelector).toExist();
    wrapper.expectElement(secondRowSelector).toExist();
    wrapper.expectElement('tr').toHaveCount(2);
  });

  it('renders the facility id for each of the fee records', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} th:contains("12345678")`).toExist();
    wrapper.expectElement(`${secondRowSelector} th:contains("87654321")`).toExist();
  });

  it('renders the exporter for each of the fee records', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} td:contains("Test exporter 1")`).toExist();
    wrapper.expectElement(`${secondRowSelector} td:contains("Test exporter 2")`).toExist();
  });

  it('renders the reported fees for each of the fee records using the numeric cell class', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} td:contains("EUR 100.00")`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:contains("EUR 100.00")`).hasClass(govukNumericCellClassName);
    wrapper.expectElement(`${secondRowSelector} td:contains("USD 500.00")`).toExist();
    wrapper.expectElement(`${secondRowSelector} td:contains("USD 500.00")`).hasClass(govukNumericCellClassName);
  });

  it('renders the reported payment for each of the fee records with the numeric cell class', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} td:contains("GBP 90.91")`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:contains("GBP 90.91")`).hasClass(govukNumericCellClassName);
    wrapper.expectElement(`${secondRowSelector} td:contains("USD 500.00")`).toExist();
    wrapper.expectElement(`${secondRowSelector} td:contains("USD 500.00")`).hasClass(govukNumericCellClassName);
  });

  it('renders a list item for each of the payments received in the first table row with the numeric cell class', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} td:has(ul.payments-list)`).toExist();
    wrapper.expectElement(`${firstRowSelector} td:has(ul.payments-list)`).hasClass(govukNumericCellClassName);

    wrapper.expectElement(`${firstRowSelector} ul.payments-list li`).toHaveCount(2);
    wrapper.expectElement(`${firstRowSelector} li:contains("GBP 90.91")`).toExist();
    wrapper.expectElement(`${firstRowSelector} li:contains("USD 500.00")`).toExist();

    wrapper.expectElement(`${secondRowSelector} ul`).notToExist();
  });

  it('does not render any payments received when they are undefined', () => {
    // Arrange
    const feeRecordPaymentGroup = {
      ...FEE_RECORD_PAYMENT_GROUP,
      paymentsReceived: undefined,
    };

    // Act
    const wrapper = render({ feeRecordPaymentGroup });

    // Assert
    wrapper.expectElement(`${firstRowSelector}:has(ul)`).notToExist();
    wrapper.expectElement(`${secondRowSelector}:has(ul)`).notToExist();
  });

  it('renders the display status badge in the first table row', () => {
    // Act
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement(`${firstRowSelector} td:contains("${FEE_RECORD_STATUS.MATCH}")`).toExist();
    wrapper.expectElement(`${secondRowSelector} td:contains("${FEE_RECORD_STATUS.MATCH}")`).notToExist();
  });
});
