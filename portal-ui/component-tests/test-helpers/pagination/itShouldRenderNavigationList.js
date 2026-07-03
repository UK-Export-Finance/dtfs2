module.exports = (getWrapper) => {
  it('should render a navigation element', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="pagination"]').toExist();
  });

  it('should give the nav landmark an accessible name via aria-labelledby pointing at the pagination heading', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('nav[aria-labelledby="pagination-heading"]').toExist();
  });

  it("should render a visually hidden header with id 'pagination-heading' and the text 'Pagination'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('h4#pagination-heading').hasClass('govuk-visually-hidden');
    wrapper.expectText('h4#pagination-heading').toRead('Pagination');
  });

  it('should render an unordered list', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('ul').hasClass('govuk-!-margin-bottom-0');
  });
};
