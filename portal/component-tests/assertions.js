const assertions = (wrapper) => ({
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
    lengthToEqual: (expectedLength) => {
      const expected = expectedLength + 1; // cheerio html() assertion automatically adds 1.
      expect(wrapper(selector).html().length).toEqual(expected);
    },
  }),
  expectInput: (selector) => ({
    toHaveValue: (value) => {
      expect(wrapper(selector).attr('value')).toEqual(value);
    },
    toBeHidden: () => {
      expect(wrapper(selector).attr('type')).toEqual('hidden');
    },
    toNotBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(false);
    },
    toBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(true);
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
});

module.exports = assertions;
