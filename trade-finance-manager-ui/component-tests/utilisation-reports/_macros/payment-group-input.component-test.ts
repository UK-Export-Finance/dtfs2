import { PaymentGroupInputsViewModel } from '../../../server/types/view-models/add-to-an-existing-payment-view-model';
import { componentRenderer } from '../../componentRenderer';
import { aPaymentGroupInputsViewModel } from '../../../test-helpers/test-data/view-models';

const component = '../templates/utilisation-reports/_macros/payment-group-input.njk';
const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = (viewModel: { legendText: string; paymentGroups: PaymentGroupInputsViewModel; errorMessage?: string }) => render(viewModel);

  it('should render the legend text', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: [],
    };
    const wrapper = getWrapper(viewModel);

    wrapper.expectText('h2[data-cy="payment-groups-heading"]').toContain('Select a payment group');
  });

  it('should render a hidden input and no radio items if there is only one payment group', () => {
    const paymentGroups: PaymentGroupInputsViewModel = [
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

    wrapper.expectElement('div.govuk-radios__item').toHaveCount(0);
    wrapper.expectElement(`input[type='radio']`).notToExist();
    wrapper.expectElement(`label[data-cy='payment-group-label--paymentIds-1']`).notToExist();

    wrapper.expectElement(`input[data-cy='paymentIds-1']`).toExist();
    wrapper.expectElement(`input[data-cy='paymentIds-1']`).toHaveAttribute('type', 'hidden');
  });

  it('should render a single payments details within a group', () => {
    const paymentGroups: PaymentGroupInputsViewModel = [
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

    wrapper.expectText(`div[data-cy='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`div[data-cy='payment-1-item-hint']`).toContain('Payment reference: REF001');
  });

  it('should render multiple payment details within a group', () => {
    const paymentGroups: PaymentGroupInputsViewModel = [
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

    wrapper.expectText(`div[data-cy='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`div[data-cy='payment-1-item-hint']`).toContain('Payment reference: REF001');
    wrapper.expectText(`div[data-cy='payment-2-currency-and-amount']`).toContain('GBP 2,000');
    wrapper.expectText(`div[data-cy='payment-2-item-hint']`).toContain('Payment reference: REF002');
  });

  it('should render radio buttons for each payment group with the group ID when there is more than one payment group', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: aPaymentGroupInputsViewModel(),
    };
    const wrapper = getWrapper(viewModel);

    const radioInputSelector = 'div.govuk-radios__item > input[type="radio"].govuk-radios__input';
    wrapper.expectElement(radioInputSelector).toHaveCount(viewModel.paymentGroups.length);

    wrapper.expectElement(`input[data-cy='payment-group-input--paymentIds-1,2']`).toHaveAttribute('value', 'paymentIds-1,2');
    wrapper.expectElement(`input[data-cy='payment-group-input--paymentIds-3']`).toHaveAttribute('value', 'paymentIds-3');
  });

  it('should render both multiple and single payment details in different groups with a radio button for each group', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: aPaymentGroupInputsViewModel(),
    };
    const wrapper = getWrapper(viewModel);

    wrapper.expectElement('div.govuk-radios__item').toHaveCount(2);

    const firstPaymentGroupInput = "[data-cy='payment-group--paymentIds-1,2']";
    wrapper.expectElement(`${firstPaymentGroupInput} input[data-cy="payment-group-input--paymentIds-1,2"]`).toHaveAttribute('value', 'paymentIds-1,2');
    wrapper.expectElement(`${firstPaymentGroupInput} input[data-cy="payment-group-input--paymentIds-1,2"]`).toHaveAttribute('id', 'paymentIds-1,2');
    wrapper.expectElement(`${firstPaymentGroupInput} label`).toHaveCount(1);
    const firstPaymentGroupLabelSelector = `${firstPaymentGroupInput} label[data-cy='payment-group-label--paymentIds-1,2']`;
    wrapper.expectText(`${firstPaymentGroupLabelSelector} div[data-cy='payment-1-currency-and-amount']`).toContain('GBP 1,000');
    wrapper.expectText(`${firstPaymentGroupLabelSelector} div[data-cy='payment-1-item-hint']`).toContain('Payment reference: REF001');
    wrapper.expectText(`${firstPaymentGroupLabelSelector} div[data-cy='payment-2-currency-and-amount']`).toContain('GBP 2,000');
    wrapper.expectText(`${firstPaymentGroupLabelSelector} div[data-cy='payment-2-item-hint']`).toContain('Payment reference: REF002');

    const secondPaymentGroupInput = "[data-cy='payment-group--paymentIds-3']";
    wrapper.expectElement(`${secondPaymentGroupInput} input[data-cy="payment-group-input--paymentIds-3"]`).toHaveAttribute('value', 'paymentIds-3');
    wrapper.expectElement(`${secondPaymentGroupInput} input[data-cy="payment-group-input--paymentIds-3"]`).toHaveAttribute('id', 'paymentIds-3');
    wrapper.expectElement(`${secondPaymentGroupInput} label`).toHaveCount(1);
    const secondPaymentGroupLabelSelector = `${secondPaymentGroupInput} label[data-cy='payment-group-label--paymentIds-3']`;
    wrapper.expectText(`${secondPaymentGroupLabelSelector} div[data-cy='payment-3-currency-and-amount']`).toContain('GBP 3,000');
    wrapper.expectText(`${secondPaymentGroupLabelSelector} div[data-cy='payment-3-item-hint']`).toContain('Payment reference: REF003');
  });

  it('does not apply error styling wrappers if no error message is provided', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: aPaymentGroupInputsViewModel(),
      errorMessage: undefined,
    };
    const wrapper = getWrapper(viewModel);

    wrapper.expectElement('div[data-cy="payment-groups-error-wrapper"]').notToExist();
    wrapper.expectElement('p[data-cy="payment-groups-inline-error-wrapper"]').notToExist();
  });

  it('applies error styling wrappers if error message is provided', () => {
    const viewModel = {
      legendText: 'Select a payment group',
      paymentGroups: aPaymentGroupInputsViewModel(),
      errorMessage: 'Whoopsies',
    };
    const wrapper = getWrapper(viewModel);

    wrapper.expectElement('div[data-cy="payment-groups-error-wrapper"]').toExist();
    wrapper.expectElement('div[data-cy="payment-groups-error-wrapper"]').hasClass('govuk-form-group--error');

    wrapper.expectElement('p[data-cy="payment-groups-inline-error-wrapper"]').toExist();
    wrapper.expectElement('p[data-cy="payment-groups-inline-error-wrapper"]').hasClass('govuk-error-message');
  });
});
