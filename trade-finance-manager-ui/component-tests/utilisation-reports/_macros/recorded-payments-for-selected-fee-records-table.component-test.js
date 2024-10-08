const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/recorded-payments-for-selected-fee-records-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  /**
   * @type {import('../../../server/types/view-models').RecordedPaymentDetailsViewModel[]}
   */
  const recordedPaymentsDetails = [
    {
      reference: 'REF1234',
      formattedDateReceived: '22 Mar 1999',
      formattedCurrencyAndAmount: 'JPY 100,000.00',
    },
    {
      formattedDateReceived: '23 Apr 2020',
      formattedCurrencyAndAmount: 'JPY 500,000.00',
    },
  ];

  const getWrapper = ({ multipleFeeRecordsSelected } = { multipleFeeRecordsSelected: false }) =>
    render({ recordedPaymentsDetails, multipleFeeRecordsSelected });

  it('should render the title with fees in the plural when there are multiple fee records selected', () => {
    const wrapper = getWrapper({ multipleFeeRecordsSelected: true });
    wrapper.expectText(`html`).toContain('Recorded payments for these fees');
  });

  it('should render the title with fees in the singular when there are not multiple fee records selected', () => {
    const wrapper = getWrapper({ multipleFeeRecordsSelected: false });
    wrapper.expectText(`html`).toContain('Recorded payments for this fee');
  });

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`thead th`).toHaveCount(3);
    wrapper.expectElement(`thead th:contains("Date received")`).toExist();
    wrapper.expectElement(`thead th:contains("Amount received")`).toExist();
    wrapper.expectElement(`thead th:contains("Payment reference")`).toExist();
  });

  it('should render one row per fee record displaying the date received, value of payment and reference if provided', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`tbody tr`).toHaveCount(2);
    wrapper.expectElement(`tbody tr:nth-child(1) td:contains("REF1234")`).toExist();
    wrapper.expectElement(`tbody tr:nth-child(1) td:contains("22 Mar 1999")`).toExist();
    wrapper.expectElement(`tbody tr:nth-child(1) td:contains("JPY 100,000.00")`).toExist();
    wrapper.expectElement(`tbody tr:nth-child(2) td:contains("23 Apr 2020")`).toExist();
    wrapper.expectElement(`tbody tr:nth-child(2) td:contains("JPY 500,000.00")`).toExist();
  });
});
