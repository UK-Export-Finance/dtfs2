import { CURRENCY } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-filters-panel.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const defaultParams = {
    filters: {
      currency: [],
      paymentReference: '',
      facilityId: '',
    },
    selectedFilters: null,
  };

  const filtersContainerSelector = '[data-cy="payment-details--filters-container"]';

  it('should render the filters panel', () => {
    const wrapper = render({});

    wrapper.expectElement('[data-cy="payment-details--filters-panel"]').toExist();
  });

  it('should render the filters form', () => {
    const wrapper = render(defaultParams);

    wrapper.expectElement('[data-cy="payment-details--filter-form"]').toExist();
  });

  it('should render the filters container', () => {
    const wrapper = render(defaultParams);

    wrapper.expectElement(filtersContainerSelector).toExist();
  });

  it('should not render selected filters when none are provided', () => {
    const wrapper = render({ ...defaultParams, selectedFilters: null });

    wrapper.expectElement('[data-cy="payment-details--selected-filters"]').notToExist();
  });

  it('should render selected filters section when selected filters are provided', () => {
    const wrapper = render({
      ...defaultParams,
      selectedFilters: {
        paymentCurrency: { value: CURRENCY.JPY, removeHref: '/remove-filter' },
      },
    });

    wrapper.expectText(`${filtersContainerSelector} .moj-filter__heading-title`).toRead('Selected filters');
    wrapper.expectText(`${filtersContainerSelector} .moj-filter__heading-action`).toRead('Clear filters');
  });

  it('should render selected payment currency filter', () => {
    const wrapper = render({
      ...defaultParams,
      selectedFilters: {
        paymentCurrency: { value: CURRENCY.JPY, removeHref: '/remove-jpy' },
      },
    });

    wrapper.expectElement(`${filtersContainerSelector} h3`).toHaveCount(1);
    wrapper.expectText(`${filtersContainerSelector} h3`).toRead('Currency');

    wrapper.expectElement(`${filtersContainerSelector} .moj-filter__tag`).toHaveCount(1);
    wrapper.expectLink(`${filtersContainerSelector} .moj-filter__tag`).toLinkTo('/remove-jpy', `Remove this filter ${CURRENCY.JPY}`);
  });

  it('should render selected payment reference filter', () => {
    const wrapper = render({
      ...defaultParams,
      selectedFilters: {
        paymentReference: { value: 'A reference', removeHref: '/remove-reference' },
      },
    });

    wrapper.expectElement(`${filtersContainerSelector} h3`).toHaveCount(1);
    wrapper.expectText(`${filtersContainerSelector} h3`).toRead('Payment reference');

    wrapper.expectElement(`${filtersContainerSelector} .moj-filter__tag`).toHaveCount(1);
    wrapper.expectLink(`${filtersContainerSelector} .moj-filter__tag`).toLinkTo('/remove-reference', 'Remove this filter A reference');
  });

  it('should render selected facility id filter', () => {
    const wrapper = render({
      ...defaultParams,
      selectedFilters: {
        facilityId: { value: '1234', removeHref: '/remove-id' },
      },
    });

    wrapper.expectElement(`${filtersContainerSelector} h3`).toHaveCount(1);
    wrapper.expectText(`${filtersContainerSelector} h3`).toRead('Facility ID');

    wrapper.expectElement(`${filtersContainerSelector} .moj-filter__tag`).toHaveCount(1);
    wrapper.expectLink(`${filtersContainerSelector} .moj-filter__tag`).toLinkTo('/remove-id', 'Remove this filter 1234');
  });

  it('should render all selected filters', () => {
    const wrapper = render({
      ...defaultParams,
      selectedFilters: {
        paymentCurrency: { value: CURRENCY.JPY, removeHref: '/remove-jpy' },
        paymentReference: { value: 'A reference', removeHref: '/remove-reference' },
        facilityId: { value: '1234', removeHref: '/remove-id' },
      },
    });

    wrapper.expectElement(`${filtersContainerSelector} h3`).toHaveCount(3);
    wrapper.expectElement(`${filtersContainerSelector} .moj-filter__tag`).toHaveCount(3);
  });
});
