/**
 * assertText
 * Check an element's text
 * @param {Object} selector: Cypress selector
 * @param {string} expected: Expected text
 */
const assertText = (selector, expected) => {
  selector.invoke('text').then((text) => {
    expect(text.trim()).equal(expected);
  });
};

module.exports = assertText;
