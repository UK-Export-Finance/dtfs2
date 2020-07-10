module.exports = (wrapper, html, params) => {
  return {
    expectLink: (selector) => {
      return {
        notToExist: () => {
          expect(wrapper(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect(wrapper(selector).attr('href') ).toBeUndefined();
          expect(wrapper(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect(wrapper(selector).attr('href') ).toEqual(href);
          expect(wrapper(selector).attr('disabled') ).toBeUndefined();
          expect(wrapper(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectPrimaryButton: (selector) => {
      return {
        notToExist: () => {
          expect(wrapper(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(true);
          expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
          expect(wrapper(selector).attr('href') ).toBeUndefined();
          expect(wrapper(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(false);
          expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(false);
          expect(wrapper(selector).attr('href') ).toEqual(href);
          expect(wrapper(selector).attr('disabled') ).toBeUndefined();
          expect(wrapper(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectSecondaryButton: (selector) => {
      return {
        notToExist: () => {
          expect(wrapper(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(true);
          expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
          expect(wrapper(selector).attr('href') ).toBeUndefined();
          expect(wrapper(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect(wrapper(selector).hasClass('govuk-button--disabled')).toEqual(false);
          expect(wrapper(selector).hasClass('govuk-button--secondary')).toEqual(true);
          expect(wrapper(selector).attr('href') ).toEqual(href);
          expect(wrapper(selector).attr('disabled') ).toBeUndefined();
          expect(wrapper(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectButtonDisguisedAsALink: (selector) => {
      return {
        notToExist: () => {
          expect(wrapper(selector).html()).toBeNull();
        },
        toLinkTo: (href, text) => {
          expect(wrapper(selector).hasClass('button-as-link')).toEqual(true);
          expect(wrapper(selector).attr('href') ).toEqual(href);
          expect(wrapper(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectText: (selector) => {
      return {
        notToExist: () => {
          expect(wrapper(selector).html()).toBeNull();
        },
        toRead: (text) => {
          expect(wrapper(selector).text().trim()).toEqual(text);
        },
        toMatch: (regex) => {
          expect(wrapper(selector).text().trim()).toMatch(regex);
        },
      }
    },
    expectElement: (selector) => {
      return {
        toExist: () => {
          expect(wrapper(selector).html()).toBeDefined();
        },
      }
    },
  };
}
