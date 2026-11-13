/**
 * keyboardInput
 * Clear and type text into an input.
 * @param {Function} selector: Cypress selector
 * @param {string} text: Text to enter
 */
export const keyboardInput = (selector, text) => {
  selector.clear().type(text, { delay: 0 });
};
