const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/table-search-form.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    tableName: 'table name',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render search input', () => {
    wrapper.expectElement('[data-cy="search-input"]').toExist();
  });

  it('should render a label for the search input', () => {
    wrapper.expectElement('[data-cy="search-input-label"]').toExist();
  });

  it('should visually hide the search input label', () => {
    wrapper.expectElement('[data-cy="search-input-label"].govuk-visually-hidden').toExist();
  });

  it('should render the search input label text', () => {
    wrapper.expectText('[data-cy="search-input-label"]').toRead('Search table name');
  });

  it('should programmatically associate the label with the search input via for/id', () => {
    wrapper.expectElement('[data-cy="search-input-label"][for="search"]').toExist();
    wrapper.expectElement('[data-cy="search-input"]#search').toExist();
  });

  it('should render search submit button', () => {
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectText('[data-cy="submit-button"]').toRead('Search table name');
  });
});
