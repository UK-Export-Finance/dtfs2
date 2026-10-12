/**
 * assertValue
 * Check an element's value
 * @param {object} selector: Cypress selector
 * @param {string} expectedValue: Expected value
 */
const assertValue = (selector, expectedValue) => {
  selector.input().should('have.value', expectedValue);
};

module.exports = assertValue;
