import { PaymentDetailsViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-table.njk';
const render = componentRenderer(component, true);

type PaymentDetailsTableViewModel = {
  paymentDetails: PaymentDetailsViewModel;
};

describe(component, () => {
  const aPaymentDetailsTableViewModel = (): PaymentDetailsTableViewModel => ({
    paymentDetails: {
      rows: [],
    },
  });

  const getWrapper = (viewModel: PaymentDetailsTableViewModel = aPaymentDetailsTableViewModel()) => render(viewModel);

  const tableHeaderSelector = (text: string) => `thead th:contains("${text}")`;

  it('renders 8 table headings', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('table thead tr').toHaveCount(1);
    wrapper.expectElement('table thead th').toHaveCount(8);
  });

  it('renders the amount heading with the aria-sort attribute set to ascending', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Amount')).toExist();
    wrapper.expectElement(tableHeaderSelector('Amount')).toHaveAttribute('aria-sort', 'ascending');
  });

  it('renders the payment reference, date received, reconciled by and date reconciled headings with the aria-sort attribute set to none', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Payment reference')).toExist();
    wrapper.expectElement(tableHeaderSelector('Payment reference')).toHaveAttribute('aria-sort', 'none');

    wrapper.expectElement(tableHeaderSelector('Date received')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date received')).toHaveAttribute('aria-sort', 'none');

    wrapper.expectElement(tableHeaderSelector('Reconciled by')).toExist();
    wrapper.expectElement(tableHeaderSelector('Reconciled by')).toHaveAttribute('aria-sort', 'none');

    wrapper.expectElement(tableHeaderSelector('Date reconciled')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date reconciled')).toHaveAttribute('aria-sort', 'none');
  });

  it('renders the facility ID and exporter headings as not sortable', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Facility ID')).toExist();
    wrapper.expectElement(tableHeaderSelector('Facility ID')).notToHaveAttribute('aria-sort');

    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).notToHaveAttribute('aria-sort');
  });

  it('should hide the facility ID and exporter headings from screenreaders', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Facility ID')).toExist();
    wrapper.expectElement(tableHeaderSelector('Facility ID')).toHaveAttribute('aria-hidden', 'true');

    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render the combined facility ID and export heading to screenreaders only', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Facility ID and Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Facility ID')).hasClass('govuk-visually-hidden');
  });
});
