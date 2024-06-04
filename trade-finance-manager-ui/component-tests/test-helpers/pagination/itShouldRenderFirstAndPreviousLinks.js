module.exports = ({ getWrapper, currentPage }) => {
  it("should render a 'First' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="First"]').toLinkTo('/testRoute/0?testQuery=test', 'First');
    wrapper.expectElement('[data-cy="First"]').hasClass('govuk-link');
  });

  it("should render a 'Previous' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Previous"]').toLinkTo(`/testRoute/${currentPage - 1}?testQuery=test`, 'Previous');
    wrapper.expectElement('[data-cy="Previous"]').hasClass('govuk-link');
  });
};
