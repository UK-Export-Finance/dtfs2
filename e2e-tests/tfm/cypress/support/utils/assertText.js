/**
 * assertText
 * Check an element's text
 * @param {object} selector: Cypress selector
 * @param {string} expected: Expected text
 */
export const assertText = (selector, expected) => {
  selector.invoke('text').then((text) => {
    expect(text.trim()).equal(expected);
  });
};
