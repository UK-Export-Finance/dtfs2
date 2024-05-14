module.exports = (getWrapper) => {
  it("should render a div with a class of 'pagination' and a role of 'navigation'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('.pagination').toHaveAttribute('role', 'navigation');
  });

  it('should display the total number of items', () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="totalItems"]').toRead('(2000 items)');
  });
};
