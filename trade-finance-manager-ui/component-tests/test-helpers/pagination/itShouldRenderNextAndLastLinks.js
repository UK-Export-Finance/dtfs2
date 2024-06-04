module.exports = ({ getWrapper, currentPage, totalPages }) => {
  it("should render a 'Next' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Next"]').toLinkTo(`/testRoute/${currentPage + 1}?testQuery=test`, 'Next');
    wrapper.expectElement('[data-cy="Next"]').hasClass('govuk-link');
  });

  it("should render a 'Last' link", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Last"]').toLinkTo(`/testRoute/${totalPages - 1}?testQuery=test`, 'Last');
    wrapper.expectElement('[data-cy="Last"]').hasClass('govuk-link');
  });
};
