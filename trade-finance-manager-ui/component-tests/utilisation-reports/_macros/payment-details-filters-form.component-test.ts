import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-filters-form.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const defaultParams = {
    filters: {
      paymentCurrency: [],
      paymentReference: '',
      facilityId: '',
    },
  };

  describe('Payment Currency filter', () => {
    const containerSelector = '[data-cy="payment-details--filter-currency"]';
    const filters = {
      paymentCurrency: [
        { value: 'GBP', text: 'GBP', attributes: { 'data-cy': 'payment-details--filter-currency-input-GBP' } },
        { value: 'USD', text: 'USD', attributes: { 'data-cy': 'payment-details--filter-currency-input-USD' } },
        { value: 'EUR', text: 'EUR', attributes: { 'data-cy': 'payment-details--filter-currency-input-EUR' } },
      ],
    };

    it('should render payment currency radio buttons when payment currency filter is provided', () => {
      const params = {
        ...defaultParams,
        filters,
      };

      const wrapper = render(params);

      wrapper.expectElement(containerSelector).toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-GBP"]').toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-USD"]').toExist();
      wrapper.expectElement('[data-cy="payment-details--filter-currency-input-EUR"]').toExist();
    });

    it('should set correct id for payment currency input', () => {
      const params = {
        ...defaultParams,
        filters,
      };

      const wrapper = render(params);

      wrapper.expectElement(containerSelector).toHaveAttribute('id', 'payment-details-payment-currency-filter');
    });

    it('should not render payment currency radio buttons when payment currency filter is not provided', () => {
      const params = { ...defaultParams, filters: {} };

      const wrapper = render(params);

      wrapper.expectElement(containerSelector).notToExist();
    });
  });

  describe('Payment Reference input', () => {
    const inputSelector = '[data-cy="payment-details--filter-payment-reference-input"]';

    it('should render payment reference input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toExist();
    });

    it('should set provided value for payment reference', () => {
      const params = { ...defaultParams, filters: { ...defaultParams.filters, paymentReference: 'REF123' } };

      const wrapper = render(params);

      wrapper.expectInput(inputSelector).toHaveValue('REF123');
    });

    it('should set correct id for payment reference input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toHaveAttribute('id', 'payment-details-payment-reference-filter');
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
      const params = { ...defaultParams, filters: { ...defaultParams.filters, facilityId: 'FAC456' } };

      const wrapper = render(params);

      wrapper.expectInput(inputSelector).toHaveValue('FAC456');
    });

    it('should set correct id for facility ID input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectElement(inputSelector).toHaveAttribute('id', 'payment-details-facility-id-filter');
    });

    it('should have correct label for facility ID input', () => {
      const wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="payment-details--filter-facility-id-label"]').toRead('Facility ID');
    });

    it('should render in line error when there is an error with the facility ID input', () => {
      const facilityIdErrorMessage = 'an error occurred';
      const params = {
        ...defaultParams,
        errors: {
          facilityIdErrorMessage,
        },
      };

      const wrapper = render(params);

      wrapper.expectElement('[data-cy="payment-details--filter-facility-id-error"]').toExist();
      wrapper.expectText('[data-cy="payment-details--filter-facility-id-error"]').toContain(facilityIdErrorMessage);
    });
  });
});
