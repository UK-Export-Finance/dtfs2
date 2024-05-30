const componentRenderer = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/selected-reported-fees-details-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  /**
   * @type {import('../../../server/types/view-models').SelectedReportedFeesDetailsViewModel[]}
   */
  const selectedReportedFeesDetailsViewModel = {
    totalReportedPayments: 'GBP 1,000,000.00',
    feeRecords: [
      {
        feeRecordId: 123,
        facilityId: '000123',
        exporter: 'Exporter 123',
        reportedFee: 'EUR 800,000.00',
        reportedPayments: 'GBP 700,000.00',
      },
      {
        feeRecordId: 456,
        facilityId: '000456',
        exporter: 'Exporter 456',
        reportedFee: 'EUR 350,000.00',
        reportedPayments: 'GBP 300,000.00',
      },
    ],
  };

  const getWrapper = () => render({ reportedFeeDetails: selectedReportedFeesDetailsViewModel });

  it('should render the table caption', () => {
    const wrapper = getWrapper();
    wrapper.expectText(`table caption`).toRead('Selected reported fees details');
  });

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`thead th`).toHaveCount(4);
    wrapper.expectElement(`thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`thead th:contains("Reported fee")`).toExist();
    wrapper.expectElement(`thead th:contains("Reported payments")`).toExist();
  });

  it('should render one row per fee record displaying the facility id, exporter, reported fee and reported payment', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-123"] th:contains("000123")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-123"] td:contains("Exporter 123")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-123"] td:contains("EUR 800,000.00")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-123"] td:contains("GBP 700,000.00")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-456"] th:contains("000456")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-456"] td:contains("Exporter 456")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-456"] td:contains("EUR 350,000.00")`).toExist();
    wrapper.expectElement(`tr[data-cy="selected-reported-fees-details-table-row--feeRecordId-456"] td:contains("GBP 300,000.00")`).toExist();
  });

  it('should render the total reported payments', () => {
    const wrapper = getWrapper();
    wrapper.expectText('tfoot').toRead('Total reported payments GBP 1,000,000.00');
  });
});
