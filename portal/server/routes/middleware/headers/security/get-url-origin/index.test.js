const getUrlOrigin = require('.');

describe('middleware/headers/security/get-url-origin', () => {
  it('should return the the origin of the URL', () => {
    const mockUrl = 'https://gov.uk/test';

    const result = getUrlOrigin(mockUrl);

    const expected = 'gov';

    expect(result).toEqual(expected);
  });

  describe('when the origin contains dashes', () => {
    it('should return the the origin of the URL', () => {
      const mockUrl = 'https://get-a-ukef-product.gov.uk';

      const result = getUrlOrigin(mockUrl);

      const expected = 'get-a-ukef-product';

      expect(result).toEqual(expected);
    });
  });

  describe('when the provided string is not a valid url', () => {
    it('should return an empy string', () => {
      const mockUrl = 'not-a-url';

      const result = getUrlOrigin(mockUrl);

      expect(result).toEqual('');
    });
  });

  describe('when a string is not provided', () => {
    it('should return an empy string', () => {
      const result = getUrlOrigin();

      expect(result).toEqual('');
    });
  });
});
