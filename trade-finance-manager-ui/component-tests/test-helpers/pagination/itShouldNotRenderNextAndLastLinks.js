module.exports = (getWrapper) => {
  it("should NOT render a 'Next' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Next_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Next"]').notToExist();
  });

  it("should NOT render a 'Last' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Last_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Last"]').notToExist();
  });
};
