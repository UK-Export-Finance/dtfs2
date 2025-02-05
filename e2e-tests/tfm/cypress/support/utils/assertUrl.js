/**
 * assertUrl
 * Check an link's HREF and text
 * @param {Function} selector: Cypress selector
 * @param {String} expectedHref: Expected HREF
 * @param {String} expectedText: Expected text
 */
const assertUrl = (selector, expectedHref, expectedText) => {
  selector.should('have.attr', 'href', expectedHref);

  cy.assertText(selector, expectedText);
};

export default assertUrl;
