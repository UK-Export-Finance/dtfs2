import { AvailablePaymentGroupsViewModel } from '../../../server/types/view-models/add-to-an-existing-payment-view-model';
import { componentRenderer } from '../../componentRenderer';
import { anAvailablePaymentGroupsViewModel } from '../../../test-helpers/test-data/available-payment-groups-view-model';

const component = '../templates/utilisation-reports/_macros/payment-group-radio-input-group.njk';
const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = (viewModel: { legendText: string; paymentGroups: AvailablePaymentGroupsViewModel }) => render(viewModel);

  it('should render the legend text', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: [],
    };
    const wrapper = getWrapper(viewModel);

    wrapper.expectText('h2[data-cy="payment-group-radio-input-heading"]').toContain('Select a payment group');
  });

  it('should render radio buttons for each payment group with the group ID', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: anAvailablePaymentGroupsViewModel(),
    };
    const wrapper = getWrapper(viewModel);

    const radioInputSelector = 'div.govuk-radios__item > input[type="radio"].govuk-radios__input';
    wrapper.expectElement(radioInputSelector).toHaveCount(viewModel.paymentGroups.length);

    wrapper.expectElement(`${radioInputSelector}:eq(0)`).toHaveAttribute('id', 'paymentIds-1,2');
    wrapper.expectElement(`${radioInputSelector}:eq(0)`).toHaveAttribute('value', 'paymentIds-1,2');

    wrapper.expectElement(`${radioInputSelector}:eq(1)`).toHaveAttribute('id', 'paymentIds-3');
    wrapper.expectElement(`${radioInputSelector}:eq(1)`).toHaveAttribute('value', 'paymentIds-3');
  });

  it('should render a single payments details within a group', () => {
    const paymentGroups: AvailablePaymentGroupsViewModel = [
      {
        radioId: 'paymentIds-1',
        payments: [{ id: '1', formattedCurrencyAndAmount: 'GBP 1,000', reference: 'REF001' }],
      },
    ];
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups,
    };
    const wrapper = getWrapper(viewModel);

    const radioSelector = 'div.govuk-radios__item';
    wrapper.expectElement(radioSelector).toHaveCount(1);

    wrapper.expectElement(`${radioSelector}:eq(0) input`).toExist();
    wrapper.expectElement(`${radioSelector}:eq(0) label`).toHaveCount(1);
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-item-hint']`).toContain('Payment reference: REF001');
  });

  it('should render multiple payment details within a group', () => {
    const paymentGroups: AvailablePaymentGroupsViewModel = [
      {
        radioId: 'paymentIds-1,2',
        payments: [
          { id: '1', formattedCurrencyAndAmount: 'GBP 1,000', reference: 'REF001' },
          { id: '2', formattedCurrencyAndAmount: 'GBP 2,000', reference: 'REF002' },
        ],
      },
    ];
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups,
    };
    const wrapper = getWrapper(viewModel);

    const radioSelector = 'div.govuk-radios__item';
    wrapper.expectElement(radioSelector).toHaveCount(1);

    wrapper.expectElement(`${radioSelector}:eq(0) input`).toExist();
    wrapper.expectElement(`${radioSelector}:eq(0) label`).toHaveCount(1);
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-item-hint']`).toContain('Payment reference: REF001');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-2-currency-and-amount']`).toContain('GBP 2,000');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-2-item-hint']`).toContain('Payment reference: REF002');
  });

  it('should render both multiple and single payment details in different groups', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: anAvailablePaymentGroupsViewModel(),
    };
    const wrapper = getWrapper(viewModel);

    const radioSelector = 'div.govuk-radios__item';
    wrapper.expectElement(radioSelector).toHaveCount(2);

    wrapper.expectElement(`${radioSelector}:eq(0) input`).toExist();
    wrapper.expectElement(`${radioSelector}:eq(0) label`).toHaveCount(1);
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-1-item-hint']`).toContain('Payment reference: REF001');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-2-currency-and-amount']`).toContain('GBP 2,000');
    wrapper.expectText(`${radioSelector}:eq(0) label:eq(0) div[id='payment-2-item-hint']`).toContain('Payment reference: REF002');

    wrapper.expectElement(`${radioSelector}:eq(1) input`).toExist();
    wrapper.expectElement(`${radioSelector}:eq(1) label`).toHaveCount(1);
    wrapper.expectText(`${radioSelector}:eq(1) label:eq(0) div[id='payment-3-currency-and-amount']`).toContain('GBP 3,000');
    wrapper.expectText(`${radioSelector}:eq(1) label:eq(0) div[id='payment-3-item-hint']`).toContain('Payment reference: REF003');
  });
});
