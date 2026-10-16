import { checkAutocompleteInput } from './autocomplete-assertions';
import { pages } from '../pages';

/**
 * assertAutocompleteInput
 * Assert an autocomplete field
 * @param {string} fieldId: Autocomplete field ID
 * @param {string} noResultsText: Text to search for that will return no results
 * @param {string} singleResultText: Text to search for that will return a single result
 * @param {string} multipleResultsText: Text to search for that will return multiple results
 * @param {string} entry1Text: Text to enter as the first entry
 * @param {string} entry2Text: Text to enter as the second entry
 */
export const assertAutocompleteInput = ({ fieldId, noResultsText, singleResultText, multipleResultsText, entry1Text, entry2Text }) => {
  const field = pages.autoCompleteField(fieldId);

  it('should have working client side JS', () => {
    checkAutocompleteInput.hasWorkingClientSideJS(field);
  });

  it('should render an input', () => {
    checkAutocompleteInput.rendersInput(field);
  });

  it('should render `no results` message when no results are found', () => {
    checkAutocompleteInput.rendersNoResultsMessage(field, noResultsText);
  });

  it('should render a single result after searching', () => {
    checkAutocompleteInput.rendersSingleResult(field, singleResultText);
  });

  it('should render multiple results after searching', () => {
    checkAutocompleteInput.rendersMultipleResults(field, multipleResultsText);
  });

  it('should allow user to remove a selected entry and search again', () => {
    checkAutocompleteInput.allowsUserToRemoveEntryAndSearchAgain(fieldId, entry1Text, entry2Text, entry2Text);
  });
};
