const componentRenderer = require('../componentRenderer');

const component = '_macros/pagination.njk';

const render = componentRenderer(component);

const {
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
} = require('../test-helpers');

describe(component, () => {
  let wrapper;
  const totalItems = 2000;
  const paginationRoute = '/testRoute';
  const queryString = '?testQuery=test';

  const getWrapper = () => wrapper;

  describe('when totalPages is small enough that an ellipsis is never rendered', () => {
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

      itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

      itShouldNotRenderNavigationList(getWrapper);

      itShouldNotRenderFirstAndPreviousLinks(getWrapper);

      itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

      itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

      itShouldNotRenderNextAndLastLinks(getWrapper);
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

      itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

      itShouldNotRenderNavigationList(getWrapper);

      itShouldNotRenderFirstAndPreviousLinks(getWrapper);

      itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

      itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

      itShouldNotRenderNextAndLastLinks(getWrapper);
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldNotRenderFirstAndPreviousLinks(getWrapper);

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 1, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 1, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldNotRenderNextAndLastLinks(getWrapper);
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldNotRenderFirstAndPreviousLinks(getWrapper);

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 2, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 2, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 2, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldNotRenderNextAndLastLinks(getWrapper);
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldNotRenderFirstAndPreviousLinks(getWrapper);

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 4, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 4, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 4, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldNotRenderNextAndLastLinks(getWrapper);
      });
    });
  });

  describe('when totalPages is large enough that not all page links can be rendered on every page and an ellipsis is rendered on some pages', () => {
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldNotRenderFirstAndPreviousLinks(getWrapper);

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 4, currentPage });

        itShouldRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 5, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 1, lastPage: 5, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldNotRenderNextAndLastLinks(getWrapper);
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldNotRenderFirstAndPreviousLinks(getWrapper);

        itShouldNotRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 0, lastPage: 4, currentPage });

        itShouldRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 45, lastPage: 53, currentPage });

        itShouldRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderNextAndLastLinks({ getWrapper, currentPage, totalPages });
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

        itShouldRenderOuterDivAndDisplayTotalItems(getWrapper);

        itShouldRenderNavigationList(getWrapper);

        itShouldRenderFirstAndPreviousLinks({ getWrapper, currentPage });

        itShouldRenderEllipsisAfterFirstAndPreviousLinks(getWrapper);

        itShouldRenderLinksToPagesInRange({ getWrapper, firstPage: 95, lastPage: 99, currentPage });

        itShouldNotRenderEllipsisBeforeNextAndLastLinks(getWrapper);

        itShouldNotRenderNextAndLastLinks(getWrapper);
      });
    });
  });
});
