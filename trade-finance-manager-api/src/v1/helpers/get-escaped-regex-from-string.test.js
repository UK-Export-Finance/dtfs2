const getEscapedRegexFromString = require('./get-escaped-regex-from-string');

describe('getEscapedRegexFromString', () => {
  it('should return a regex', () => {
    const string = 'test';
    const result = getEscapedRegexFromString(string);

    expect(result).toEqual(/^test$/i);
  });

  it('should return a regex with special characters escaped', () => {
    const string = 'test*';
    const result = getEscapedRegexFromString(string);

    expect(result).toEqual(/^test\*$/i);
  });
});
