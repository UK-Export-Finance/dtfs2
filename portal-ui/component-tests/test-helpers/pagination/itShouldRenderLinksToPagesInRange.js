module.exports = ({ getWrapper, firstPage, lastPage, currentPage }) => {
  it(`should render direct links to pages in the range ${firstPage} to ${lastPage} inclusive (zero-indexed)`, () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`[data-cy="Page_${firstPage - 1}_listItem"]`).notToExist();
    wrapper.expectLink(`[data-cy="Page_${firstPage - 1}"]`).notToExist();

    for (let index = firstPage; index <= lastPage; index += 1) {
      wrapper.expectElement(`[data-cy="Page_${index}_listItem"]`).hasClass('govuk-body');
      wrapper.expectElement(`[data-cy="Page_${index}_listItem"]`).hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink(`[data-cy="Page_${index}"]`).toLinkTo(`/testRoute/${index}?testQuery=test`, `Page ${index + 1}`);
      wrapper.expectElement(`[data-cy="Page_${index}"]`).hasClass('govuk-link');

      if (index === currentPage) {
        wrapper.expectElement(`[data-cy="Page_${index}_listItem"]`).hasClass('active');
        wrapper.expectElement(`[data-cy="Page_${index}"]`).toHaveAttribute('aria-current', 'page');
      } else {
        wrapper.expectElement(`[data-cy="Page_${index}_listItem"]`).doesNotHaveClass('active');
        wrapper.expectElement(`[data-cy="Page_${index}"]`).notToHaveAttribute('aria-current');
      }
    }

    wrapper.expectElement(`[data-cy="Page_${lastPage + 1}_listItem"]`).notToExist();
    wrapper.expectLink(`[data-cy="Page_${lastPage + 1}"]`).notToExist();
  });
};
