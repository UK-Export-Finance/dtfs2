module.exports = (getWrapper) => {
  it('should not render a navigation element', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="pagination"]').notToExist();
  });

  it("should render a visually hidden header with the text 'Pagination'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('h4').hasClass('govuk-visually-hidden');
    wrapper.expectText('h4').toRead('Pagination');
  });

  it('should render an unordered list', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('ul').hasClass('govuk-!-margin-bottom-0');
  });
};
