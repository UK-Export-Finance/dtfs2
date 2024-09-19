/**
 * keyboardInput
 * Clear and type text into an input.
 * @param {Function} selector: Cypress selector
 * @param {String} text: Text to enter
 */
const keyboardInput = (selector, text) => {
  selector.clear().type(text, { delay: 0 });
};

export default keyboardInput;
