export type AssertionsWrapper = {
  html: string;
  expectLink: (selector: string) => {
    notToExist: () => void;
    toBeDisabled: () => void;
    toLinkTo: (href: string, text: string) => void;
  };
  expectPrimaryButton: (selector: string) => {
    notToExist: () => void;
    toBeDisabled: () => void;
    toLinkTo: (href: string, text: string) => void;
  };
  expectSecondaryButton: (selector: string) => {
    notToExist: () => void;
    toBeDisabled: () => void;
    toLinkTo: (href: string, text: string) => void;
  };
  expectText: (selector: string) => {
    notToExist: () => void;
    toRead: (text: string) => void;
    toMatch: (regex: RegExp) => void;
    toContain: (text: string) => void;
  };
  expectElement: (selector: string) => {
    toExist: () => void;
    notToExist: () => void;
    hasClass: (value: string) => void;
    doesNotHaveClass: (value: string) => void;
    toHaveAttribute: (attribute: string, value: string) => void;
    lengthToEqual: (expectedLength: number) => void;
    toHaveCount: (expectedCount: number) => void;
  };
  expectInput: (selector: string) => {
    toHaveValue: (value: string) => void;
    toBeHidden: () => void;
    toNotBeChecked: () => void;
    toBeChecked: () => void;
  };
  expectTextArea: (selector: string) => {
    toHaveValue: (value: string) => void;
  };
  expectAriaLabel: (selector: string) => {
    toEqual: (text: string) => void;
  };
};
