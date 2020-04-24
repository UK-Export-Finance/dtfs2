module.exports = ($, html, params) => {
  return {
    expectLink: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect($(selector).attr('href') ).toBeUndefined();
          expect($(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect($(selector).attr('href') ).toEqual(href);
          expect($(selector).attr('disabled') ).toBeUndefined();
          expect($(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectPrimaryButton: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect($(selector).hasClass('govuk-button--disabled')).toEqual(true);
          expect($(selector).hasClass('govuk-button--secondary')).toEqual(false);
          expect($(selector).attr('href') ).toBeUndefined();
          expect($(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect($(selector).hasClass('govuk-button--disabled')).toEqual(false);
          expect($(selector).hasClass('govuk-button--secondary')).toEqual(false);
          expect($(selector).attr('href') ).toEqual(href);
          expect($(selector).attr('disabled') ).toBeUndefined();
          expect($(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectSecondaryButton: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect($(selector).hasClass('govuk-button--disabled')).toEqual(true);
          expect($(selector).hasClass('govuk-button--secondary')).toEqual(true);
          expect($(selector).attr('href') ).toBeUndefined();
          expect($(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href, text) => {
          expect($(selector).hasClass('govuk-button--disabled')).toEqual(false);
          expect($(selector).hasClass('govuk-button--secondary')).toEqual(true);
          expect($(selector).attr('href') ).toEqual(href);
          expect($(selector).attr('disabled') ).toBeUndefined();
          expect($(selector).text().trim() ).toEqual(text);
        }
      };
    },
    expectText: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toRead: (text) => {
          expect($(selector).text().trim()).toEqual(text);
        },
        toMatch: (regex) => {
          expect($(selector).text().trim()).toMatch(regex);
        },
      }
    }
  };
}
