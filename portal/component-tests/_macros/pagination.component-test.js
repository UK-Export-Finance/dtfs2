const componentRenderer = require('../componentRenderer');

const component = '_macros/pagination.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let totalPages;
  let currentPage;
  const totalItems = 2000;
  const paginationRoute = '/testRoute';
  const queryString = '?testQuery=test';

  const shouldRenderOuterDivAndDisplayTotalItems = () => {
    it('should render a div with a class of \'breadcrumbs\' and a role of \'navigation\'', () => {
      wrapper.expectElement('.breadcrumbs').toHaveAttribute('role', 'navigation');
    });

    it('should display the total number of items', () => {
      wrapper.expectText('[data-cy="totalItems"]').toRead('(2000 items)');
    });
  };

  const shouldRenderNavigationList = () => {
    it('should render a div with a role of \'navigation\'', () => {
      wrapper.expectElement('[data-cy="pagination"]').toHaveAttribute('role', 'navigation');
    });

    it('should render a visually hidden header with the text \'Pagination\'', () => {
      wrapper.expectElement('h4').hasClass('govuk-visually-hidden');
      wrapper.expectText('h4').toRead('Pagination');
    });

    it('should render an unordered list', () => {
      wrapper.expectElement('ul').hasClass('govuk-!-margin-bottom-0');
    });
  };

  const shouldNOTRenderNavigationList = () => {
    it('should NOT render a div with a role of \'navigation\'', () => {
      wrapper.expectElement('[data-cy="navigation"]').notToExist();
    });

    it('should NOT render a visually hidden header with the text \'Pagination\'', () => {
      wrapper.expectElement('h4').notToExist();
    });

    it('should NOT render an unordered list', () => {
      wrapper.expectElement('ul').notToExist();
    });
  };

  const shouldRenderFirstAndPreviousLinksAndEllipsis = (activePage) => {
    it('should render a \'First\' link', () => {
      wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="First"]').toLinkTo('/testRoute/0?testQuery=test', 'First');
      wrapper.expectElement('[data-cy="First"]').hasClass('govuk-link');
    });

    it('should render a \'Previous\' link', () => {
      wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Previous"]').toLinkTo(`/testRoute/${activePage - 1}?testQuery=test`, 'Previous');
      wrapper.expectElement('[data-cy="Previous"]').hasClass('govuk-link');
    });

    it('should render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-!-margin-bottom-3');
      wrapper.expectText('[data-cy="firstPreviousEllipsis"]').toRead('...');
    });
  };

  const shouldNOTRenderFirstAndPreviousLinksAndEllipsis = () => {
    it('should NOT render a \'First\' link', () => {
      wrapper.expectElement('[data-cy="First_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="First"]').notToExist();
    });

    it('should NOT render a \'Previous\' link', () => {
      wrapper.expectElement('[data-cy="Previous_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Previous"]').notToExist();
    });

    it('should NOT render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').notToExist();
    });
  };

  const shouldRenderEllipsisAndNextAndLastLinks = (activePage) => {
    it('should render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').toRead('...');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-!-margin-bottom-3');
    });

    it('should render a \'Next\' link', () => {
      wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Next"]').toLinkTo(`/testRoute/${activePage + 1}?testQuery=test`, 'Next');
      wrapper.expectElement('[data-cy="Next"]').hasClass('govuk-link');
    });

    it('should render a \'Last\' link', () => {
      wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Last"]').toLinkTo('/testRoute/99?testQuery=test', 'Last');
      wrapper.expectElement('[data-cy="Last"]').hasClass('govuk-link');
    });
  };

  const shouldNOTRenderEllipsisAndNextAndLastLinks = () => {
    it('should NOT render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').notToExist();
    });

    it('should NOT render a \'Next\' link', () => {
      wrapper.expectElement('[data-cy="Next_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Next"]').notToExist();
    });

    it('should NOT render a \'Last\' link', () => {
      wrapper.expectElement('[data-cy="Last_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Last"]').notToExist();
    });
  };

  describe('when totalPages is 1 or less', () => {
    beforeEach(() => {
      totalPages = 1;
      currentPage = 0;

      wrapper = render({
        totalPages,
        currentPage,
        totalItems,
        paginationRoute,
        queryString,
      });
    });

    shouldRenderOuterDivAndDisplayTotalItems();

    shouldNOTRenderNavigationList();

    shouldNOTRenderFirstAndPreviousLinksAndEllipsis();

    shouldNOTRenderEllipsisAndNextAndLastLinks();
  });

  describe('when totalPages is more than 1', () => {
    describe('when currentPage is 0', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 0;
        wrapper = render({
          totalPages,
          currentPage,
          totalItems,
          paginationRoute,
          queryString,
        });
      });

      shouldRenderOuterDivAndDisplayTotalItems();

      shouldRenderNavigationList();

      it('should render direct links to the first 4 pages', () => {
        for (let i = 0; i < 4; i += 1) {
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

        wrapper.expectElement('[data-cy="Page_4_listItem"]').notToExist();
        wrapper.expectLink('[data-cy="Page_4"]').notToExist();
      });

      shouldRenderEllipsisAndNextAndLastLinks(0);

      shouldNOTRenderFirstAndPreviousLinksAndEllipsis();
    });

    describe('when currentPage is the last page', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 99;
        wrapper = render({
          totalPages,
          currentPage,
          totalItems,
          paginationRoute,
          queryString,
        });
      });

      shouldRenderOuterDivAndDisplayTotalItems();

      shouldRenderNavigationList();

      shouldRenderFirstAndPreviousLinksAndEllipsis(99);

      it('should render direct links to the last 6 pages', () => {
        wrapper.expectElement('[data-cy="Page_93_listItem"]').notToExist();
        wrapper.expectLink('[data-cy="Page_93"]').notToExist();

        for (let i = 94; i < 100; i += 1) {
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
      });

      shouldNOTRenderEllipsisAndNextAndLastLinks();
    });

    describe('when currentPage is neither 0 nor the last page', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 49;
        wrapper = render({
          totalPages,
          currentPage,
          totalItems,
          paginationRoute,
          queryString,
        });
      });

      shouldRenderOuterDivAndDisplayTotalItems();

      shouldRenderNavigationList();

      shouldRenderFirstAndPreviousLinksAndEllipsis(49);

      it('should render direct links to the 5 pages before and the 3 pages after the current page, as well as the current page itself', () => {
        wrapper.expectElement('[data-cy="Page_43_listItem"]').notToExist();
        wrapper.expectLink('[data-cy="Page_43"]').notToExist();

        for (let i = 44; i < 53; i += 1) {
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

        wrapper.expectElement('[data-cy="Page_53_listItem"]').notToExist();
        wrapper.expectLink('[data-cy="Page_53"]').notToExist();
      });

      shouldRenderEllipsisAndNextAndLastLinks(49);
    });
  });
});
