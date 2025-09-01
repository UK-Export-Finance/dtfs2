module.exports = (getWrapper) => {
  it("should render an ellipsis after the 'First' and 'Previous' links", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-!-margin-bottom-3');
    wrapper.expectText('[data-cy="firstPreviousEllipsis"]').toRead('...');
  });
};
