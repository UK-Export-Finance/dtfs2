import { SelectOption } from '../types';

/**
 * maps a select option to the SelectOption type
 * if the value matches the selectedValue, it will set the selected property to true
 * otherwise, it will set the selected property to false
 * @param text - the text to display for the select option
 * @param value - the value of the select option
 * @param selectedValue - the value of the currently selected option
 * @returns a SelectOption object with text, value, and selected properties
 */
export const mapSelectOption = (text: string, value: string, selectedValue?: string): SelectOption => {
  const mapped = {
    text,
    value,
    selected: false,
  };

  if (selectedValue && selectedValue === value) {
    mapped.selected = true;
  }

  return mapped;
};
