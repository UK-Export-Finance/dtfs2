import assertions from '../autocomplete-assertions';
import pages from '../pages';

/**
 * assertCountryAutocompleteInput
 * Assert a country autocomplete field
 * @param {string} fieldId: Country field ID
 * @param {boolean} assertFilteredCisCountries: Whether to check for filtered CIS countries.
 */
export const assertAutocompleteInput = ({ fieldId, noResultsText, singleResultText, multipleResultsText, entry1Text, entry2Text }) => {
  const field = pages.autoCompleteField(fieldId);

  it('has working client side JS', () => {
    assertions.hasWorkingClientSideJS(field);
  });

  it('renders an input', () => {
    assertions.rendersInput(field);
  });

  it('renders `no results` message when no results are found', () => {
    assertions.rendersNoResultsMessage(field, noResultsText);
  });

  it('renders a single  result after searching', () => {
    assertions.rendersSingleResult(field, singleResultText);
  });

  it('renders multiple country results after searching', () => {
    assertions.rendersMultipleResults(field);
  });

  it('allows user to remove a selected country and search again', () => {
    assertions.allowsUserToRemoveEntryAndSearchAgain(fieldId, entry1Text, entry2Text, entry2Text);
  });
};

export default assertCountryAutocompleteInput;
