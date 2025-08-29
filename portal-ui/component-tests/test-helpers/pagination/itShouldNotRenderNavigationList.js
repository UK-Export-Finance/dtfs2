module.exports = (getWrapper) => {
  it("should NOT render a div with a role of 'navigation'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="navigation"]').notToExist();
  });

  it("should NOT render a visually hidden header with the text 'Pagination'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('h4').notToExist();
  });

  it('should NOT render an unordered list', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('ul').notToExist();
  });
};
