const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/premium-payments-table.njk';
const tableSelector = '[data-cy="premium-payments-table"]';

const render = componentRenderer(component);

describe(component, () => {
  /**
   * @type {import('../../../server/controllers/utilisation-reports/helpers/reconciliation-for-report-helper').FeeRecordViewModelItem[]}
   */
  const feeRecords = [
    {
      id: 1,
      facilityId: '12345678',
      exporter: 'Test exporter',
      reportedFees: 'GBP 100.00',
      reportedPayments: 'GBP 100.00',
      totalReportedPayments: 'GBP 100.00',
      paymentsReceived: undefined,
      totalPaymentsReceived: undefined,
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus: 'TO DO',
    },
    {
      id: 2,
      facilityId: '87654321',
      exporter: 'Test exporter 2',
      reportedFees: 'EUR 150.00',
      reportedPayments: 'GBP 100.00',
      totalReportedPayments: 'GBP 100.00',
      paymentsReceived: 'GBP 100.00',
      totalPaymentsReceived: 'GBP 100.00',
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus: 'TO DO',
    },
  ];

  const getWrapper = () => render({ feeRecords });

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(9);
    wrapper.expectElement(`${tableSelector} thead th:contains("")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Facility ID")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Exporter")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total reported payments")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total payments received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
  });

  it('should render the table data', () => {
    const wrapper = getWrapper();

    feeRecords.forEach((feeRecord) => {
      const rowSelector = `[data-cy="premium-payments-table-row--feeRecordId-${feeRecord.id}"]`;

      const checkboxSelector = `${rowSelector} > td > div > div > input#feeRecordId-${feeRecord.id}`;
      wrapper.expectElement(checkboxSelector).toExist();

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${feeRecord.facilityId}")`).toExist();

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(8);
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.exporter}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedFees}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.reportedPayments}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalReportedPayments}")`).toExist();

      if (feeRecord.paymentsReceived) {
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.paymentsReceived}")`).toExist();
      }
      if (feeRecord.totalPaymentsReceived) {
        wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.totalPaymentsReceived}")`).toExist();
      }

      wrapper.expectElement(`${rowSelector} td:contains("${feeRecord.displayStatus}")`).toExist();
    });
  });
});
