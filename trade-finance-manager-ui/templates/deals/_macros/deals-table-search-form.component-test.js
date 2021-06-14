/* eslint-disable no-underscore-dangle */
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/deals/_macros/deals-table-search-form.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {};

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render search input', () => {
    wrapper.expectElement('[data-cy="search-input"]').toExist();
    wrapper.expectAriaLabel('[data-cy="search-input"]').toEqual('Search deals');
  });

  it('should render search submit button', () => {
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectAriaLabel('[data-cy="submit-button"]').toEqual('Submit search');
  });

  it('should render search submit button icon', () => {
    wrapper.expectElement('[data-cy="submit-button-search-icon"]').toExist();
  });
});
