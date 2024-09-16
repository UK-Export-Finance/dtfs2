import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-filters-form.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const defaultParams = {
    filters: {
      currency: [],
    },
    paymentReference: '',
    facilityId: '',
  };

  describe('Currency filter', () => {
    it('should render currency radio buttons when currency filter is provided', () => {
      const params = {
        ...defaultParams,
        filters: {
          currency: [
            { value: 'GBP', text: 'GBP', attributes: { 'data-cy': 'payment-details--filter-currency-input-GBP' } },
            { value: 'USD', text: 'USD', attributes: { 'data-cy': 'payment-details--filter-currency-input-USD' } },
            { value: 'EUR', text: 'EUR', attributes: { 'data-cy': 'payment-details--filter-currency-input-EUR' } },
          ],
        },
      };

      const wrapper = render(params);

      wrapper.expectElement('[data-cy="payment-details--filter-currency"]').toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-GBP"]').toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-USD"]').toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-EUR"]').toExist();
    });

    it('should not render currency radio buttons when currency filter is not provided', () => {
      const params = { ...defaultParams, filters: {} };

      const wrapper = render(params);

      wrapper.expectElement('[data-cy="payment-details--filter-currency"]').notToExist();
    });
  });

  describe('Payment Reference input', () => {
    const inputSelector = '[data-cy="payment-details--filter-payment-reference-input"]';

    it('should render payment reference input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toExist();
    });

    it('should set provided value for payment reference', () => {
      const params = { ...defaultParams, paymentReference: 'REF123' };

      const wrapper = render(params);

      wrapper.expectInput(inputSelector).toHaveValue('REF123');
    });

    it('should set correct id for payment reference input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toHaveAttribute('id', 'paymentReference');
    });

    it('should have correct label for payment reference input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="payment-details--filter-payment-reference-label"]').toRead('Payment reference');
    });
  });

  describe('Facility ID input', () => {
    const inputSelector = '[data-cy="payment-details--filter-facility-id-input"]';

    it('should render facility ID input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toExist();
    });

    it('should set provided value for facility ID', () => {
      const params = { ...defaultParams, facilityId: 'FAC456' };

      const wrapper = render(params);

      wrapper.expectInput(inputSelector).toHaveValue('FAC456');
    });

    it('should set correct id for facility ID input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toHaveAttribute('id', 'facilityId');
    });

    it('should have correct label for facility ID input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="payment-details--filter-facility-id-label"]').toRead('Facility ID');
    });
  });
});
