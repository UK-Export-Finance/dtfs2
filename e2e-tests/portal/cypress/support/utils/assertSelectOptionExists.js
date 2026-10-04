/**
 * asserts that a select element contains an option with the given text
 * uses assertText to assert the exact text of the option, rather than just checking that it exists
 * @param {Function} selectElement - the select element to check
 * @param {string} optionText - the text of the option to check for
 */
const assertSelectOptionExists = (selectElement, optionText) => {
  const eachOption = selectElement.find('option').filter((_, option) => option.innerText.trim() === optionText);

  cy.assertText(eachOption, optionText);
};

export default assertSelectOptionExists;
