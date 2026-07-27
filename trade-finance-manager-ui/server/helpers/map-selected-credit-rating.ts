/**
 * maps the selected credit rating value to the corresponding radios or other credit rating value
 * some credit ratings are saved as "Good (BB-)" or "Acceptable (B+)" in TFM but newer ones are saved as "BB-" or "B+"
 * ensures that the correct radio is selected for the credit rating value saved in TFM
 * if Good (BB-) or BB- is provided, the corresponding radio is selected
 * if Acceptable (B+) or B+ is provided, the corresponding radio is selected
 * if any other value is provided, the "Other" radio is selected and the value is displayed in the "Other" input field
 * @param selectedValue - the selected credit rating value saved in TFM
 * @returns an object with the corresponding radios or other credit rating value
 */
export const mapSelectedCreditRating = (selectedValue: string) => {
  const goodSelected = Boolean(selectedValue === 'Good (BB-)' || selectedValue === 'BB-');
  const acceptableSelected = Boolean(selectedValue === 'Acceptable (B+)' || selectedValue === 'B+');
  const otherSelected = Boolean(selectedValue && !goodSelected && !acceptableSelected);
  let otherCreditRatingValue = '';

  if (otherSelected && selectedValue) {
    otherCreditRatingValue = selectedValue;
  }

  return {
    goodSelected,
    acceptableSelected,
    otherSelected,
    otherCreditRatingValue,
  };
};
