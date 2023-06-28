import { replaceCharactersWithCharacterCode } from './sanitiseData';

describe('helpers/sanitise-data', () => {
  describe('replaceCharactersWithCharacterCode', () => {
    it('should replace ampersand characters', () => {
      const result = replaceCharactersWithCharacterCode('&test&');

      const expected = '&amp;test&amp;';

      expect(result).toEqual(expected);
    });

    it('should replace `lower than` characters', () => {
      const result = replaceCharactersWithCharacterCode('<test<');

      const expected = '&lt;test&lt;';

      expect(result).toEqual(expected);
    });

    it('should replace `greater than` characters', () => {
      const result = replaceCharactersWithCharacterCode('>test>');

      const expected = '&gt;test&gt;';

      expect(result).toEqual(expected);
    });

    it('should replace quote characters', () => {
      const result = replaceCharactersWithCharacterCode('"test"');

      const expected = '&quot;test&quot;';

      expect(result).toEqual(expected);
    });

    it('should replace apostrophe characters', () => {
      const result = replaceCharactersWithCharacterCode("'test'");

      const expected = '&#x27;test&#x27;';

      expect(result).toEqual(expected);
    });

    it('should replace forward slash characters', () => {
      const result = replaceCharactersWithCharacterCode('/test/');

      const expected = '&#x2F;test&#x2F;';

      expect(result).toEqual(expected);
    });

    it('should replace star characters', () => {
      const result = replaceCharactersWithCharacterCode('**');

      const expected = '&#42;&#42;';

      expect(result).toEqual(expected);
    });

    describe('when no string is provided', () => {
      it('should return an empty string', () => {
        const result = replaceCharactersWithCharacterCode();

        const expected = '';

        expect(result).toEqual(expected);
      });
    });
  });
});
