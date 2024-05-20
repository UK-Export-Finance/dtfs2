module.exports = (getWrapper) => {
  it("should NOT render an ellipsis before the 'Next' and 'Last' links", () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="nextLastEllipsis"]').notToExist();
  });
};
