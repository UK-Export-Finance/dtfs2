import validationErrorHandler from './validationErrorHandler.helper';

describe('validationErrorHandler()', () => {
  it('returns false if no errors passed', () => {
    expect(validationErrorHandler()).toEqual(false);
  });

  it('converts an error object into the correct validation errors', () => {
    const mockedError = {
      errRef: 'abc',
      errMsg: 'message',
    };

    expect(validationErrorHandler(mockedError)).toEqual({
      errorSummary: [{
        text: 'message',
        href: '#abc',
      }],
      fieldErrors: {
        abc: {
          text: 'message',
        },
      },
    });
  });

  it('passing a `href` arguments adds it before the #hash', () => {
    const mockedError = {
      errRef: 'abc',
      errMsg: 'message',
    };
    expect(validationErrorHandler([mockedError], 'my-link')).toEqual({
      errorSummary: [{
        text: 'message',
        href: 'my-link#abc',
      }],
      fieldErrors: {
        abc: {
          text: 'message',
        },
      },
    });
  });
});
