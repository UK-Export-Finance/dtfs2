/**
 * assertUrl
 * Check an link's HREF and text
 * @param {Function} selector: Cypress selector
 * @param {string} expectedHref: Expected HREF
 * @param {string} expectedText: Expected text
 */
const assertUrl = (selector, expectedHref, expectedText) => {
  selector.should('have.attr', 'href', expectedHref);

  cy.assertText(selector, expectedText);
};

export default assertUrl;
