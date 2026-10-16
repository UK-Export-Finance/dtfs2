/**
 * assertLength
 * Assert that total length of some elements.
 * @param {object} selector: Cypress selector
 * @param {number} expectedLength: Expected amount
 */
export const assertLength = (selector, expectedLength) => {
  selector.should('have.length', expectedLength);
};
