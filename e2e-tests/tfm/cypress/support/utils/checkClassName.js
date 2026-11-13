/**
 * checkClassName
 * Check an elements class name
 * @param {object} selector: Cypress selector
 * @param {string} expectedClassName: Expected class name
 */
export const checkClassName = (selector, expectedClassName) => {
  selector.should('have.attr', 'class', expectedClassName);
};
