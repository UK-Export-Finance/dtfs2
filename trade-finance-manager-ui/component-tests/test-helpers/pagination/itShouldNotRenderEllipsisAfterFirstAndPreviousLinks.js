module.exports = (getWrapper) => {
  it("should NOT render an ellipsis after the 'First' and 'Previous' links", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').notToExist();
  });
};
