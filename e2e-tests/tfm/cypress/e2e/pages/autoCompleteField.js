/**
 * autoCompleteField
 * "Autocomplete" cypress selector.
 * This field is used for any autocomplete fields, e.g country and currency fields.
 * @param {string} fieldId: Field ID
 * @returns {object} Autocomplete field selectors with bespoke input, result and noResults selectors.
 */
export const autoCompleteField = (fieldId) => ({
  input: () => cy.get(`#${fieldId}`),
  results: () => cy.get(`#${fieldId} + ul li`),
  noResults: () => cy.get('.autocomplete__option--no-results'),
  selectOption: (option) =>
    cy
      .get(`[id^="${fieldId}__option--"]`)
      .filter((_, el) => el.innerText.trim() === option)
      .first(),
});
