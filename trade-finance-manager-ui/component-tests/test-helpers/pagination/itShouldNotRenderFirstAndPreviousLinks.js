module.exports = (getWrapper) => {
  it("should NOT render a 'First' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="First_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="First"]').notToExist();
  });

  it("should NOT render a 'Previous' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Previous_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Previous"]').notToExist();
  });
};
