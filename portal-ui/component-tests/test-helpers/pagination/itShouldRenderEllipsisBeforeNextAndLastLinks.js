module.exports = (getWrapper) => {
  it("should render an ellipsis before the 'Next' and 'Last' links", () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="nextLastEllipsis"]').toRead('...');
    wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-!-margin-bottom-3');
  });
};
