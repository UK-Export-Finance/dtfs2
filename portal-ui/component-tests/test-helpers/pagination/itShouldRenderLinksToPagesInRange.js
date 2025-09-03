module.exports = ({ getWrapper, firstPage, lastPage, currentPage }) => {
  it(`should render direct links to pages in the range ${firstPage} to ${lastPage} inclusive (zero-indexed)`, () => {
    const wrapper = getWrapper();

    wrapper.expectElement(`[data-cy="Page_${firstPage - 1}_listItem"]`).notToExist();
    wrapper.expectLink(`[data-cy="Page_${firstPage - 1}"]`).notToExist();

    for (let i = firstPage; i <= lastPage; i += 1) {
      wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('govuk-body');
      wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink(`[data-cy="Page_${i}"]`).toLinkTo(`/testRoute/${i}?testQuery=test`, (i + 1).toString());
      wrapper.expectElement(`[data-cy="Page_${i}"]`).hasClass('govuk-link');

      if (i === currentPage) {
        wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('active');
      } else {
        wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).doesNotHaveClass('active');
      }
    }

    wrapper.expectElement(`[data-cy="Page_${lastPage + 1}_listItem"]`).notToExist();
    wrapper.expectLink(`[data-cy="Page_${lastPage + 1}"]`).notToExist();
  });
};
