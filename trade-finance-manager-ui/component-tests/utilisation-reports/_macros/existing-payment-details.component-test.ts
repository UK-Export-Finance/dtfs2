import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/existing-payment-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = (params: { payment: { id: string; formattedCurrencyAndAmount: string; reference?: string } }) => render(params);

  it('should display the currency and amount', () => {
    const params = {
      payment: { id: '1', formattedCurrencyAndAmount: 'GBP 1,000' },
    };
    const wrapper = getWrapper(params);

    wrapper.expectText('div[data-cy="payment-1-currency-and-amount"]').toContain('GBP 1,000');
  });

  it('should add margin bottom class when there is no reference', () => {
    const params = {
      payment: { id: '1', formattedCurrencyAndAmount: 'GBP 1,000' },
    };
    const wrapper = getWrapper(params);

    wrapper.expectElement('div[data-cy="payment-1-currency-and-amount"]').hasClass('govuk-!-margin-bottom-2');
  });

  it('should not add margin bottom class when there is a reference', () => {
    const params = {
      payment: { id: '1', formattedCurrencyAndAmount: 'GBP 1,000', reference: 'REF007' },
    };
    const wrapper = getWrapper(params);

    wrapper.expectElement('div[data-cy="payment-1-currency-and-amount"]').doesNotHaveClass('govuk-!-margin-bottom-2');
  });

  it('should display the payment reference when provided', () => {
    const params = {
      payment: { id: '1', formattedCurrencyAndAmount: 'GBP 1,000', reference: 'REF007' },
    };
    const wrapper = getWrapper(params);

    wrapper.expectText('div[data-cy="payment-1-item-hint"]').toContain('Payment reference: REF007');
  });

  it('should not display the payment reference when not provided', () => {
    const params = {
      payment: { id: '1', formattedCurrencyAndAmount: 'GBP 1,000' },
    };
    const wrapper = getWrapper(params);

    wrapper.expectElement('div[data-cy="payment-1-item-hint"]').notToExist();
  });
});
