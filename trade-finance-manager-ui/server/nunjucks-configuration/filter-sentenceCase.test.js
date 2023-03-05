import sentenceCase from './filter-sentenceCase';

describe('Nunjucks filter - sentenceCase', () => {
  describe('Should return argument as response', () => {
    it('Should return `null`', () => {
      const result = sentenceCase(null);
      expect(result).toEqual(null);
    });

    it('Should return `undefined`', () => {
      const result = sentenceCase(undefined);
      expect(result).toEqual(undefined);
    });

    it('Should return ``', () => {
      const result = sentenceCase('');
      expect(result).toEqual('');
    });

    it('Should return `  `', () => {
      const result = sentenceCase('  ');
      expect(result).toEqual('  ');
    });

    it('Should return `123`', () => {
      const result = sentenceCase(123);
      expect(result).toEqual(123);
    });

    it('Should return `[]`', () => {
      const result = sentenceCase([]);
      expect(result).toEqual([]);
    });

    it('Should return `{}`', () => {
      const result = sentenceCase({});
      expect(result).toEqual({});
    });
  });

  describe('Should return in sentence case', () => {
    it('Should return `Digital trade finance system`', () => {
      const result = sentenceCase('Digital Trade Finance System');
      expect(result).toEqual('Digital trade finance system');
    });

    it('Should return `Digital TRaDE finance SYSTEM`', () => {
      const result = sentenceCase('Digital TRaDE finance SYSTEM');
      expect(result).toEqual('Digital trade finance system');
    });

    it('Should return `DIGITAL TRADE FINANCE SYSTEM`', () => {
      const result = sentenceCase('DIGITAL TRADE FINANCE SYSTEM');
      expect(result).toEqual('Digital trade finance system');
    });

    it('Should return `digital trade finance system`', () => {
      const result = sentenceCase('digital trade finance system');
      expect(result).toEqual('Digital trade finance system');
    });

    it('Should return `Exporter`', () => {
      const result = sentenceCase('exporter');
      expect(result).toEqual('Exporter');
    });

    it('Should return `bond issuer details`', () => {
      const result = sentenceCase('bond issuer details');
      expect(result).toEqual('Bond issuer details');
    });
  });
});
