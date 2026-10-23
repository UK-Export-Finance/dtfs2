import pages from '../../e2e/pages';

/**
 * autocompleteKeyboardInput
 * Type text into an autocomplete input.
 * For example, country or currency autocomplete fields.
 * @param {string} fieldId: Autocomplete field ID
 * @param {string} text: Text to enter
 */
const autocompleteKeyboardInput = (fieldId, text) => {
  const autocompleteField = pages.autoCompleteField(fieldId);

  cy.keyboardInput(autocompleteField.input(), text);

  autocompleteField.selectOption(text).click();
};

export default autocompleteKeyboardInput;
