import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/payment-details-filters-action-bar.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  it('should render the action bar', () => {
    const params = {
      selectedFilters: [],
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--filters-action-bar"]').toExist();
  });

  it('should not render selected filters when none are provided', () => {
    const params = {
      selectedFilters: [],
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filters"]').notToExist();
  });

  it('should render selected filters when provided', () => {
    const params = {
      selectedFilters: [
        {
          heading: { text: 'Field 1' },
          items: [
            { href: '/remove-filter1', text: 'Filter 1', formattedValue: 'filter1' },
            { href: '/remove-filter2', text: 'Filter 2', formattedValue: 'filter2' },
          ],
        },
      ],
    };
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filters"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-filter1"]').toExist();
    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-filter2"]').toExist();
  });

  it('should render correct text for selected filters', () => {
    const params = {
      selectedFilters: [
        {
          heading: { text: 'Field 1' },
          items: [{ href: '/remove-filter1', text: 'Filter 1', formattedValue: 'filter1' }],
        },
      ],
    };

    const wrapper = render(params);

    wrapper.expectText('[data-cy="payment-details--main-container-selected-filter-filter1"]').toContain('Filter 1');
  });

  it('should render correct href for selected filters', () => {
    const params = {
      selectedFilters: [
        {
          heading: { text: 'Field 1' },
          items: [{ href: '/remove-filter1', text: 'Filter 1', formattedValue: 'filter1' }],
        },
      ],
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="payment-details--main-container-selected-filter-filter1"]').toHaveAttribute('href', '/remove-filter1');
  });
});
