const { obscureEmail } = require('./obscure-email');

describe('obscureEmail', () => {
  it('throws an error if the email does not include an @ sign', () => {
    expect(() => obscureEmail('no-at-sign.example.com')).toThrow();
  });

  it('throws an error if the email does not have a character before the @ sign', () => {
    expect(() => obscureEmail('@blank.com')).toThrow();
  });

  it('throws an error if the email only has whitespace before the @ sign', () => {
    expect(() => obscureEmail(' @whitespace.com')).toThrow();
  });

  it.each([
    {
      original: 'some.e-mail@example.com',
      expected: 's***l@example.com',
    },
    {
      original: 'ab@example.com',
      expected: 'a***b@example.com',
    },
    {
      original: 'a@example.com',
      expected: 'a***a@example.com',
    },
  ])(
    'returns the first character before the @, 3 stars, the last character before the @, then the rest of the original string ($original -> $expected)',
    ({ original, expected }) => {
      const obscured = obscureEmail(original);
      expect(obscured).toBe(expected);
    },
  );

  it('removes any characters after and including a second @ sign', () => {
    const obscured = obscureEmail('2-@-signs@example.com');
    expect(obscured).toBe('2***-@-signs');
  });
});
