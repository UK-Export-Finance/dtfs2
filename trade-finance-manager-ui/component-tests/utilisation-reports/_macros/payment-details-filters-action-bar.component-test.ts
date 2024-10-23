import { CURRENCY } from '@ukef/dtfs2-common';
import { PaymentDetailsViewModel, SelectedFilter } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

type ViewModel = Pick<PaymentDetailsViewModel, 'selectedFilters'>;

const component = '../templates/utilisation-reports/_macros/payment-details-filters-action-bar.njk';
const render = componentRenderer(component, true);

const aSelectedFilter = (): SelectedFilter => ({
  value: 'text to display',
  removeHref: '/remove-href',
});

describe(component, () => {
  it('should render the action bar', () => {
    const params: ViewModel = {
      selectedFilters: null,
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--filters-action-bar"]').toExist();
  });

  it('should not render selected filters when none are provided', () => {
    const params: ViewModel = {
      selectedFilters: null,
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filters"]').notToExist();
  });

  it('should render selected filters when provided', () => {
    const params: ViewModel = {
      selectedFilters: {
        paymentCurrency: aSelectedFilter(),
        paymentReference: aSelectedFilter(),
        facilityId: aSelectedFilter(),
      },
    };
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filters"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentCurrency"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentReference"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-facilityId"]').toExist();
  });

  it('should not render unprovided selected filters', () => {
    const params: ViewModel = {
      selectedFilters: {
        paymentCurrency: null,
        paymentReference: null,
        facilityId: null,
      },
    };
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filters"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentCurrency"]').notToExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentReference"]').notToExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-facilityId"]').notToExist();
  });

  it('should render value as display text for selected filters', () => {
    const params: ViewModel = {
      selectedFilters: {
        paymentCurrency: { ...aSelectedFilter(), value: CURRENCY.JPY },
        paymentReference: { ...aSelectedFilter(), value: 'a reference' },
        facilityId: { ...aSelectedFilter(), value: '12345678' },
      },
    };

    const wrapper = render(params);

    wrapper.expectText('[data-cy="payment-details--main-container-selected-filter-paymentCurrency"]').toContain(CURRENCY.JPY);
    wrapper.expectText('[data-cy="payment-details--main-container-selected-filter-paymentReference"]').toContain('a reference');
    wrapper.expectText('[data-cy="payment-details--main-container-selected-filter-facilityId"]').toContain('12345678');
  });

  it('should render correct href for selected filters', () => {
    const params: ViewModel = {
      selectedFilters: {
        paymentCurrency: { ...aSelectedFilter(), removeHref: '/remove-currency-href' },
        paymentReference: { ...aSelectedFilter(), removeHref: '/remove-reference-href' },
        facilityId: { ...aSelectedFilter(), removeHref: '/remove-facility-id-href' },
      },
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentCurrency"]').toHaveAttribute('href', '/remove-currency-href');
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-paymentReference"]').toHaveAttribute('href', '/remove-reference-href');
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-facilityId"]').toHaveAttribute('href', '/remove-facility-id-href');
  });
});
