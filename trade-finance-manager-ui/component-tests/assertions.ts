import { CheerioAPI } from 'cheerio';

export const assertions = <TParams extends object>(wrapper: CheerioAPI, html: string, params: TParams) => ({
  html,
  params,
  expectLink: (selector: string) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
    },
    toLinkTo: (href: string, text: string) => {
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectPrimaryButton: (selector: string) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
      expect(wrapper(selector).attr('aria-disabled')).toEqual('true');
    },
    toLinkTo: (href: string, text: string) => {
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).attr('aria-disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectSecondaryButton: (selector: string) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toBeDisabled: () => {
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
      expect(wrapper(selector).attr('href')).toBeUndefined();
      expect(wrapper(selector).attr('disabled')).toEqual('disabled');
      expect(wrapper(selector).attr('aria-disabled')).toEqual('true');
    },
    toLinkTo: (href: string, text: string) => {
      expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).attr('aria-disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectWarningButton: (selector: string) => ({
    toLinkTo: (href: string, text: string) => {
      expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(false);
      expect(wrapper(selector).hasClass('govuk-button--warning')).toEqual(true);
      expect(wrapper(selector).attr('href')).toEqual(href);
      expect(wrapper(selector).attr('disabled')).toBeUndefined();
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
  }),
  expectText: (selector: string) => ({
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    toRead: (text: string) => {
      expect(wrapper(selector).text().trim()).toEqual(text);
    },
    toMatch: (regex: RegExp) => {
      expect(wrapper(selector).text().trim()).toMatch(regex);
    },
    toContain: (text: string) => {
      expect(wrapper(selector).text().trim()).toContain(text);
    },
    notToContain: (text: string) => {
      expect(wrapper(selector).text().trim()).not.toContain(text);
    },
  }),
  expectElement: (selector: string) => ({
    toExist: () => {
      expect(wrapper(selector).html()).not.toBeNull();
    },
    notToExist: () => {
      expect(wrapper(selector).html()).toBeNull();
    },
    hasClass: (value: string) => {
      expect(wrapper(selector).hasClass(value)).toEqual(true);
    },
    doesNotHaveClass: (value: string) => {
      expect(wrapper(selector).hasClass(value)).toEqual(false);
    },
    lengthToEqual: (expectedLength: string) => {
      const expected = expectedLength + 1; // cheerio html() assertion automatically adds 1.
      expect(wrapper(selector).html()?.length).toEqual(expected);
    },
    toHaveCount: (expectedCount: number) => {
      expect(wrapper(selector).length).toEqual(expectedCount);
    },
    toHaveAttribute: (attr: string, value: string) => {
      expect(wrapper(selector).attr(attr)).toEqual(value);
    },
    notToHaveAttribute: (attr: string) => {
      expect(wrapper(selector).attr(attr)).toBeUndefined();
    },
  }),
  expectInput: (selector: string) => ({
    toHaveValue: (value?: string) => {
      expect(wrapper(selector).attr('value')).toEqual(value);
    },
    toBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(true);
    },
    notToBeChecked: () => {
      expect(wrapper(selector).is(':checked')).toEqual(false);
    },
  }),
  expectTextArea: (selector: string) => ({
    toHaveValue: (value: string) => {
      expect(wrapper(selector).val()).toEqual(value);
    },
  }),
  expectAriaLabel: (selector: string) => ({
    toEqual: (text: string) => {
      expect(wrapper(selector).attr('aria-label')).toEqual(text);
    },
  }),
  expectAriaSort: (selector: string) => ({
    toEqual: (text: string) => {
      expect(wrapper(selector).attr('aria-sort')).toEqual(text);
    },
  }),
  expectPageTitle: () => ({
    toRead: (text: string) => {
      const titleText = wrapper('title').text();
      const result = titleText.replace(', Trade Finance Manager, gov.uk', '').trim();

      expect(result).toEqual(text);
    },
  }),
});
