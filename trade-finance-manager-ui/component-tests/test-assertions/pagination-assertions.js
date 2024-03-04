function itShouldRenderOuterDivAndDisplayTotalItems(getWrapper) {
  it('should render a div with a class of \'pagination\' and a role of \'navigation\'', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('.pagination').toHaveAttribute('role', 'navigation');
  });

  it('should display the total number of items', () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="totalItems"]').toRead('(2000 items)');
  });
}

function itShouldRenderNavigationList(getWrapper) {
  it('should render a div with a role of \'navigation\'', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="pagination"]').toHaveAttribute('role', 'navigation');
  });

  it('should render a visually hidden header with the text \'Pagination\'', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('h4').hasClass('govuk-visually-hidden');
    wrapper.expectText('h4').toRead('Pagination');
  });

  it('should render an unordered list', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('ul').hasClass('govuk-!-margin-bottom-0');
  });
}

function itShouldNotRenderNavigationList(getWrapper) {
  it('should NOT render a div with a role of \'navigation\'', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="navigation"]').notToExist();
  });

  it('should NOT render a visually hidden header with the text \'Pagination\'', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('h4').notToExist();
  });

  it('should NOT render an unordered list', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('ul').notToExist();
  });
}

function itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage }) {
  it('should render a \'First\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="First"]').toLinkTo('/testRoute/0?testQuery=test', 'First');
    wrapper.expectElement('[data-cy="First"]').hasClass('govuk-link');
  });

  it('should render a \'Previous\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Previous"]').toLinkTo(`/testRoute/${currentPage - 1}?testQuery=test`, 'Previous');
    wrapper.expectElement('[data-cy="Previous"]').hasClass('govuk-link');
  });
}

function itShouldNotRenderFirstAndPreviousLinks(getWrapper) {
  it('should NOT render a \'First\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="First_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="First"]').notToExist();
  });

  it('should NOT render a \'Previous\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Previous_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Previous"]').notToExist();
  });
}

function itShouldRenderEllipsisAfterFirstAndPreviousLinks(getWrapper) {
  it('should render an ellipsis after the \'First\' and \'Previous\' links', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-!-margin-bottom-3');
    wrapper.expectText('[data-cy="firstPreviousEllipsis"]').toRead('...');
  });
}

function itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper) {
  it('should NOT render an ellipsis after the \'First\' and \'Previous\' links', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').notToExist();
  });
}

function itShouldRenderLinksToPagesInRange({ getWrapper, firstPage, lastPage, currentPage }) {
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
}

function itShouldRenderEllipsisBeforeNextAndLastLinks(getWrapper) {
  it('should render an ellipsis before the \'Next\' and \'Last\' links', () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="nextLastEllipsis"]').toRead('...');
    wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-!-margin-bottom-3');
  });
}

function itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper) {
  it('should NOT render an ellipsis before the \'Next\' and \'Last\' links', () => {
    const wrapper = getWrapper();

    wrapper.expectText('[data-cy="nextLastEllipsis"]').notToExist();
  });
}

function itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages }) {
  it('should render a \'Next\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Next"]').toLinkTo(`/testRoute/${currentPage + 1}?testQuery=test`, 'Next');
    wrapper.expectElement('[data-cy="Next"]').hasClass('govuk-link');
  });

  it('should render a \'Last\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-!-margin-bottom-3');

    wrapper.expectLink('[data-cy="Last"]').toLinkTo(`/testRoute/${totalPages - 1}?testQuery=test`, 'Last');
    wrapper.expectElement('[data-cy="Last"]').hasClass('govuk-link');
  });
}

function itShouldNotRenderNextAndLastLinks(getWrapper) {
  it('should NOT render a \'Next\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Next_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Next"]').notToExist();
  });

  it('should NOT render a \'Last\' link', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('[data-cy="Last_listItem"]').notToExist();

    wrapper.expectLink('[data-cy="Last"]').notToExist();
  });
}

module.exports = {
  itShouldRenderOuterDivAndDisplayTotalItems,
  itShouldRenderNavigationList,
  itShouldNotRenderNavigationList,
  itShouldRenderFirstAndPreviousLinks,
  itShouldNotRenderFirstAndPreviousLinks,
  itShouldRenderEllipsisAfterFirstAndPreviousLinks,
  itShouldNotRenderEllipsisAfterFirstAndPreviousLinks,
  itShouldRenderLinksToPagesInRange,
  itShouldRenderEllipsisBeforeNextAndLastLinks,
  itShouldNotRenderEllipsisBeforeNextAndLastLinks,
  itShouldRenderNextAndLastLinks,
  itShouldNotRenderNextAndLastLinks,
};
