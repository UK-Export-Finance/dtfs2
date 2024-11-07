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
    selectedFilters: [
      {
        heading: {
          text: 'Field 1',
        },
        items: [
          {
            href: '/path/to/remove/item',
            text: 'Value 1',
          },
        ],
      },
    ],
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

  it('should render the clear filters button when no selected filters are provided', () => {
    const params = {
      ...defaultParams,
      selectedFilters: [],
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--clear-filters-button"]').toExist();
  });

  it('should not render the clear filters button when selected filters are provided', () => {
    const wrapper = render(defaultParams);

    wrapper.expectElement('[data-cy="payment-details--clear-filters-button"]').notToExist();
  });

  it('should not render selected filters when none are provided', () => {
    const wrapper = render(defaultParams);

    wrapper.expectElement('[data-cy="payment-details--selected-filters"]').notToExist();
  });

  it('should render selected filters when provided', () => {
    const wrapper = render(defaultParams);

    wrapper.expectText(`${filtersContainerSelector} .moj-filter__heading-title`).toRead('Selected filters');
    wrapper.expectText(`${filtersContainerSelector} .moj-filter__heading-action`).toRead('Clear filters');

    wrapper.expectElement(`${filtersContainerSelector} h3`).toHaveCount(1);
    wrapper.expectText(`${filtersContainerSelector} h3`).toRead('Field 1');

    wrapper.expectElement(`${filtersContainerSelector} .moj-filter__tag`).toHaveCount(1);
    wrapper.expectText(`${filtersContainerSelector} .moj-filter__tag`).toContain('Value 1');
  });
});
