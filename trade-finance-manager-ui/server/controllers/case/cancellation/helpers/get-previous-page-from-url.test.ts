import { getPreviousPageUrl } from './get-previous-page-from-url';

const previousPages = ['reason', 'bank-request-date', 'effective-from-date', 'check-details'];

const dealId = 'abcdef123456';

describe('getPreviousPageUrl', () => {
  describe.each(previousPages)('when the provided url is for the %s page', (page) => {
    it('returns the correct relative url, when given a relative URL', () => {
      // Arrange
      const url = `/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId);

      // Assert
      expect(response).toBe(`/case/${dealId}/cancellation/${page}`);
    });

    it('returns the correct relative url, when given an absolute URL', () => {
      // Arrange
      const url = `www.example.com/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId);

      // Assert
      expect(response).toBe(`/case/${dealId}/cancellation/${page}`);
    });

    it('returns the correct relative url, when given a localhost URL', () => {
      // Arrange
      const url = `localhost:5003/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId);

      // Assert
      expect(response).toBe(`/case/${dealId}/cancellation/${page}`);
    });
  });

  it('returns a URL for the deal summary page if the provided URL is not recognised', () => {
    // Arrange
    const url = `/case/${dealId}/cancellation/`;

    // Act
    const response = getPreviousPageUrl(url, dealId);

    // Assert
    expect(response).toBe(`/case/${dealId}/deal`);
  });
});
