export const assertIsCheckboxCheckedReturnsValueWithInput = (isCheckboxChecked: (checkboxId: string) => boolean, input: string, expectedOutput: boolean) => {
  expect(isCheckboxChecked(input)).toBe(expectedOutput);
};
