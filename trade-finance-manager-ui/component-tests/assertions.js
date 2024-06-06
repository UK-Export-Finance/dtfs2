// eslint-disable-next-line no-unused-vars
const assertions = (wrapper, html, params) => ({
  html,
  params,
  expectLink: (selector) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
    },
    toLinkTo: (href, text) => {
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectPrimaryButton: (selector) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(true);
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
    },
    toLinkTo: (href, text) => {
      expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(false);
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectSecondaryButton: (selector) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(true);
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
    },
    toLinkTo: (href, text) => {
      expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(false);
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectText: (selector) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toRead: (text) => {
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
    toMatch: (regex) => {
      expect(wrapper(selector).text().trim()).toMatch(regex);
    },
    toContain: (text) => {
      expect(wrapper(selector).text().trim()).toContain(text);
    },
  }),
  expectElement: (selector) => ({
    toExist: () => {
      expect(wrapper(selector).html()).not.toBeNull();
    },
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    hasClass: (value) => {
      expect(wrapper(selector).hasClass(value)).toEqual(true);
    },
    doesNotHaveClass: (value) => {
      expect(wrapper(selector).hasClass(value)).toEqual(false);
    },
    lengthToEqual: (expectedLength) => {
      const expected = expectedLength + 1; // cheerio html() assertion automatically adds 1.
      expect(wrapper(selector).html().length).toEqual(expected);
    },
    toHaveCount: (expectedCount) => {
      expect(wrapper(selector).length).toEqual(expectedCount);
    },
    toHaveAttribute: (attr, value) => {
      expect(wrapper(selector).attr(attr)).toEqual(value);
    },
  }),
  expectInput: (selector) => ({
    toHaveValue: (value) => {
      expect(wrapper(selector).attr('value')).toEqual(value);
    },
    toBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(true);
    },
    notToBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(false);
    },
  }),
  expectTextArea: (selector) => ({
    toHaveValue: (value) => {
      expect(wrapper(selector).val()).toEqual(value);
    },
  }),
  expectAriaLabel: (selector) => ({
    toEqual: (text) => {
      expect(wrapper(selector).attr('aria-label')).toEqual(text);
    },
  }),
  expectAriaSort: (selector) => ({
    toEqual: (text) => {
      expect(wrapper(selector).attr('aria-sort')).toEqual(text);
    },
  }),
});

export default assertions;
