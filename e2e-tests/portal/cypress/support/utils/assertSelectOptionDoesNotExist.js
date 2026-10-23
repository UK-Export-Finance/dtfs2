/**
 * asserts that a select element does not contain an option with the given text
 * checks that the option does not exist in the select element
 * @param {Function} selectElement - the select element to check
 * @param {string} optionText - the text of the option that should not exist
 */
const assertSelectOptionDoesNotExist = (selectElement, optionText) => {
  selectElement
    .find('option')
    .filter((_, option) => option.innerText.trim() === optionText)
    .should('not.exist');
};

export default assertSelectOptionDoesNotExist;
