const componentRenderer = require('../componentRenderer');

const component = '_macros/pagination.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const totalItems = 2000;
  const paginationRoute = '/testRoute';
  const queryString = '?testQuery=test';

  describe('when totalPages is small enough that all page links can be rendered on all pages (and an ellipsis is never rendered)', () => {
    describe('when totalPages is 0', () => {
      const totalPages = 0;
      const currentPage = 0;

      beforeEach(() => {
        wrapper = render({
          totalPages,
          currentPage,
          totalItems,
          paginationRoute,
          queryString,
        });
      });

      itShouldRenderOuterDivAndDisplayTotalItems();

      itShouldNOTRenderNavigationList();

      itShouldNOTRenderFirstAndPreviousLinks();

      itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

      itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

      itShouldNOTRenderNextAndLastLinks();
    });

    describe('when totalPages is 1', () => {
      const totalPages = 1;
      const currentPage = 0;

      beforeEach(() => {
        wrapper = render({
          totalPages,
          currentPage,
          totalItems,
          paginationRoute,
          queryString,
        });
      });

      itShouldRenderOuterDivAndDisplayTotalItems();

      itShouldNOTRenderNavigationList();

      itShouldNOTRenderFirstAndPreviousLinks();

      itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

      itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

      itShouldNOTRenderNextAndLastLinks();
    });

    describe('when totalPages is 2', () => {
      const totalPages = 2;

      describe('when on the first page', () => {
        const currentPage = 0;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldNOTRenderFirstAndPreviousLinks();

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 1, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the last page', () => {
        const currentPage = 1;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 1, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldNOTRenderNextAndLastLinks();
      });
    });

    describe('when totalPages is 3', () => {
      const totalPages = 3;

      describe('when on the first page', () => {
        const currentPage = 0;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldNOTRenderFirstAndPreviousLinks();

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 2, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the middle page', () => {
        const currentPage = 1;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 2, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the last page', () => {
        const currentPage = 2;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 2, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldNOTRenderNextAndLastLinks();
      });
    });

    describe('when totalPages is 5', () => {
      const totalPages = 5;

      describe('when on the first page', () => {
        const currentPage = 0;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldNOTRenderFirstAndPreviousLinks();

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 4, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on a middle page', () => {
        const currentPage = 2;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 4, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the last page', () => {
        const currentPage = 4;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 4, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldNOTRenderNextAndLastLinks();
      });
    });
  });

  describe(`when totalPages is large enough that not all page links can be rendered on every page and an ellipsis is rendered on some pages`, () => {
    describe('when totalPages is 6', () => {
      const totalPages = 6;

      describe('when on the first page', () => {
        const currentPage = 0;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldNOTRenderFirstAndPreviousLinks();

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 4, currentPage });

        itShouldRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on a middle page', () => {
        const currentPage = 2;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 5, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the last page', () => {
        const currentPage = 5;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 1, lastPage: 5, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldNOTRenderNextAndLastLinks();
      });
    });

    describe('when totalPages is 100', () => {
      const totalPages = 100;

      describe('when on the first page', () => {
        const currentPage = 0;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldNOTRenderFirstAndPreviousLinks();

        itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 0, lastPage: 4, currentPage });

        itShouldRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on a middle page', () => {
        const currentPage = 49;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 45, lastPage: 53, currentPage });

        itShouldRenderEllipsisBeforeNextAndLastLinks();

        itShouldRenderNextAndLastLinks({ currentPage, totalPages });
      });

      describe('when on the last page', () => {
        const currentPage = 99;

        beforeEach(() => {
          wrapper = render({
            totalPages,
            currentPage,
            totalItems,
            paginationRoute,
            queryString,
          });
        });

        itShouldRenderOuterDivAndDisplayTotalItems();

        itShouldRenderNavigationList();

        itShouldRenderFirstAndPreviousLinks(currentPage);

        itShouldRenderEllipsisAfterFirstAndPreviousLinks();

        itShouldRenderLinksToPagesInRange({ firstPage: 95, lastPage: 99, currentPage });

        itShouldNOTRenderEllipsisBeforeNextAndLastLinks();

        itShouldNOTRenderNextAndLastLinks();
      });
    });
  });

  function itShouldRenderOuterDivAndDisplayTotalItems() {
    it('should render a div with a class of \'breadcrumbs\' and a role of \'navigation\'', () => {
      wrapper.expectElement('.breadcrumbs').toHaveAttribute('role', 'navigation');
    });

    it('should display the total number of items', () => {
      wrapper.expectText('[data-cy="totalItems"]').toRead('(2000 items)');
    });
  };

  function itShouldRenderNavigationList() {
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

  function itShouldNOTRenderNavigationList() {
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

  function itShouldRenderFirstAndPreviousLinks(currentPage) {
    it('should render a \'First\' link', () => {
      wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="First_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="First"]').toLinkTo('/testRoute/0?testQuery=test', 'First');
      wrapper.expectElement('[data-cy="First"]').hasClass('govuk-link');
    });

    it('should render a \'Previous\' link', () => {
      wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Previous_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Previous"]').toLinkTo(`/testRoute/${currentPage - 1}?testQuery=test`, 'Previous');
      wrapper.expectElement('[data-cy="Previous"]').hasClass('govuk-link');
    });
  };

  function itShouldNOTRenderFirstAndPreviousLinks() {
    it('should NOT render a \'First\' link', () => {
      wrapper.expectElement('[data-cy="First_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="First"]').notToExist();
    });

    it('should NOT render a \'Previous\' link', () => {
      wrapper.expectElement('[data-cy="Previous_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Previous"]').notToExist();
    });
  };

  function itShouldRenderEllipsisAfterFirstAndPreviousLinks() {
    it('should render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').hasClass('govuk-!-margin-bottom-3');
      wrapper.expectText('[data-cy="firstPreviousEllipsis"]').toRead('...');
    });
  };

  function itShouldNOTRenderEllipsisAfterFirstAndPreviousLinks() {
    it('should NOT render an ellipsis after the \'First\' and \'Previous\' links', () => {
      wrapper.expectElement('[data-cy="firstPreviousEllipsis"]').notToExist();
    });
  };

  function itShouldRenderLinksToPagesInRange({ firstPage, lastPage, currentPage }) {
    it(`should render direct links to pages in the range ${firstPage} to ${lastPage} inclusive (zero-indexed)`, () => {
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

  function itShouldRenderEllipsisBeforeNextAndLastLinks() {
    it('should render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').toRead('...');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="nextLastEllipsis"]').hasClass('govuk-!-margin-bottom-3');
    });
  };

  function itShouldNOTRenderEllipsisBeforeNextAndLastLinks() {
    it('should NOT render an ellipsis before the \'Next\' and \'Last\' links', () => {
      wrapper.expectText('[data-cy="nextLastEllipsis"]').notToExist();
    });
  };

  function itShouldRenderNextAndLastLinks({ currentPage, totalPages }) {
    it('should render a \'Next\' link', () => {
      wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Next_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Next"]').toLinkTo(`/testRoute/${currentPage + 1}?testQuery=test`, 'Next');
      wrapper.expectElement('[data-cy="Next"]').hasClass('govuk-link');
    });

    it('should render a \'Last\' link', () => {
      wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-body');
      wrapper.expectElement('[data-cy="Last_listItem"]').hasClass('govuk-!-margin-bottom-3');

      wrapper.expectLink('[data-cy="Last"]').toLinkTo(`/testRoute/${totalPages - 1}?testQuery=test`, 'Last');
      wrapper.expectElement('[data-cy="Last"]').hasClass('govuk-link');
    });
  };

  function itShouldNOTRenderNextAndLastLinks() {
    it('should NOT render a \'Next\' link', () => {
      wrapper.expectElement('[data-cy="Next_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Next"]').notToExist();
    });

    it('should NOT render a \'Last\' link', () => {
      wrapper.expectElement('[data-cy="Last_listItem"]').notToExist();

      wrapper.expectLink('[data-cy="Last"]').notToExist();
    });
  };
});
