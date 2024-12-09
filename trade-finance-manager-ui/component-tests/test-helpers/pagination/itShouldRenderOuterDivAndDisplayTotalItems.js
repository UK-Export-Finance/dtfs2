module.exports = (getWrapper) => {
  it('should render a navigation element', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="pagination"]').toExist();
  });

  it('should display the total number of items', () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="totalItems"]').toRead('(2000 items)');
  });
};
