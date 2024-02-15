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

  const shouldRenderFirstAndPreviousLinks = (activePage) => {
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
  };

  const shouldNOTRenderFirstAndPreviousLinks = () => {
    it('should NOT render a \'First\' link', () => {
      wrapper.expectElement('[data-cy="First_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="First"]').notToExist();
    });

    it('should NOT render a \'Previous\' link', () => {
      wrapper.expectElement('[data-cy="Previous_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Previous"]').notToExist();
    });
  };

  const shouldRenderEllipsisAfterFirstAndPreviousLinks = () => {
    it('should render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-!-margin-bottom-3');
      wrapper.expectText('[data-cy="firstPreviousEllipsis"]').toRead('...');
    });
  };

  const shouldNOTRenderEllipsisAfterFirstAndPreviousLinks = () => {
    it('should NOT render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').notToExist();
    });
  };

  const shouldRenderEllipsisBeforeNextAndLastLinks = () => {
    it('should render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').toRead('...');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-!-margin-bottom-3');
    });
  };

  const shouldNOTRenderEllipsisBeforeNextAndLastLinks = () => {
    it('should NOT render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').notToExist();
    });
  };

  const shouldRenderNextAndLastLinks = (activePage) => {
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

  const shouldNOTRenderNextAndLastLinks = () => {
    it('should NOT render a \'Next\' link', () => {
      wrapper.expectElement('[data-cy="Next_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Next"]').notToExist();
    });

    it('should NOT render a \'Last\' link', () => {
      wrapper.expectElement('[data-cy="Last_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Last"]').notToExist();
    });
  };

  const shouldRenderLinksToCurrentPageAnd5PagesBeforeAnd3PagesAfter = (activePage) => {
    it('should render direct links to the 5 pages before and the 3 pages after the current page, as well as the current page itself', () => {
      wrapper.expectElement(`[data-cy="Page_${activePage - 6}_listItem"]`).notToExist();
      wrapper.expectLink(`[data-cy="Page_${activePage - 6}"]`).notToExist();

      for (let i = activePage - 5; i < activePage + 4; i += 1) {
        wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('govuk-body');
        wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('govuk-!-margin-bottom-3');

        wrapper.expectLink(`[data-cy="Page_${i}"]`).toLinkTo(`/testRoute/${i}?testQuery=test`, (i + 1).toString());
        wrapper.expectElement(`[data-cy="Page_${i}"]`).hasClass('govuk-link');

        if (i === activePage) {
          wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).hasClass('active');
        } else {
          wrapper.expectElement(`[data-cy="Page_${i}_listItem"]`).doesNotHaveClass('active');
        }
      }

      wrapper.expectElement(`[data-cy="Page_${activePage + 4}_listItem"]`).notToExist();
      wrapper.expectLink(`[data-cy="Page_${activePage + 4}"]`).notToExist();
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

    shouldNOTRenderFirstAndPreviousLinks();

    shouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

    shouldNOTRenderEllipsisBeforeNextAndLastLinks();

    shouldNOTRenderNextAndLastLinks();
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

      shouldRenderEllipsisBeforeNextAndLastLinks();

      shouldRenderNextAndLastLinks(0);

      shouldNOTRenderFirstAndPreviousLinks();

      shouldNOTRenderEllipsisAfterFirstAndPreviousLinks();
    });

    describe('when currentPage is 5', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 5;
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

      shouldRenderFirstAndPreviousLinks(5);

      shouldRenderLinksToCurrentPageAnd5PagesBeforeAnd3PagesAfter(5);

      shouldRenderEllipsisBeforeNextAndLastLinks();

      shouldRenderNextAndLastLinks(5);

      shouldNOTRenderEllipsisAfterFirstAndPreviousLinks();
    });

    describe('when currentPage is 6', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 6;
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

      shouldRenderFirstAndPreviousLinks(6);

      shouldRenderEllipsisAfterFirstAndPreviousLinks();

      shouldRenderLinksToCurrentPageAnd5PagesBeforeAnd3PagesAfter(6);

      shouldRenderEllipsisBeforeNextAndLastLinks();

      shouldRenderNextAndLastLinks(6);
    });

    describe('when currentPage is 95', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 95;
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

      shouldRenderFirstAndPreviousLinks(95);

      shouldRenderEllipsisAfterFirstAndPreviousLinks();

      shouldRenderLinksToCurrentPageAnd5PagesBeforeAnd3PagesAfter(95);

      shouldRenderEllipsisBeforeNextAndLastLinks();

      shouldRenderNextAndLastLinks(95);
    });

    describe('when currentPage is 96', () => {
      beforeEach(() => {
        totalPages = 100;
        currentPage = 96;
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

      shouldRenderFirstAndPreviousLinks(96);

      shouldRenderEllipsisAfterFirstAndPreviousLinks();

      shouldRenderLinksToCurrentPageAnd5PagesBeforeAnd3PagesAfter(96);

      shouldRenderNextAndLastLinks(96);

      shouldNOTRenderEllipsisBeforeNextAndLastLinks();
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

      shouldRenderFirstAndPreviousLinks(99);

      shouldRenderEllipsisAfterFirstAndPreviousLinks();

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

      shouldNOTRenderEllipsisBeforeNextAndLastLinks();

      shouldNOTRenderNextAndLastLinks();
    });
  });
});
