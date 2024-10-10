import { getPreviousPageUrlForCancelCancellation, getPreviousPageUrlForCancellationFlow } from './get-previous-page-url-for-cancel-cancellation';

const dealId = 'abcdef123456';

describe('getPreviousPageUrlForCancelCancellation', () => {
  const previousPages = ['reason', 'bank-request-date', 'effective-from-date', 'check-details'];

  describe.each(previousPages)('when the provided url is for the %s page', (page) => {
    it('returns the correct relative url, when given a relative URL', () => {
      // Arrange
      const url = `/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrlForCancelCancellation(url, dealId);

      // Assert
      expect(response).toEqual(`/case/${dealId}/cancellation/${page}`);
    });

    it('returns the correct relative url, when given an absolute URL', () => {
      // Arrange
      const url = `www.example.com/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrlForCancelCancellation(url, dealId);

      // Assert
      expect(response).toEqual(`/case/${dealId}/cancellation/${page}`);
    });

    it('returns the correct relative url, when given a localhost URL', () => {
      // Arrange
      const url = `localhost:5003/case/${dealId}/cancellation/${page}`;

      // Act
      const response = getPreviousPageUrlForCancelCancellation(url, dealId);

      // Assert
      expect(response).toEqual(`/case/${dealId}/cancellation/${page}`);
    });
  });

  it('returns a URL for the deal summary page if the provided URL is not recognised', () => {
    // Arrange
    const url = `/case/${dealId}/cancellation/`;

    // Act
    const response = getPreviousPageUrlForCancelCancellation(url, dealId);

    // Assert
    expect(response).toEqual(`/case/${dealId}/deal`);
  });
});

describe('getPreviousPageUrlForCancellationFlow', () => {
  it('returns the correct relative url when status is not passed in', () => {
    // Arrange
    const defaultPreviousPage = `/defaultPreviousPage`;

    // Act
    const response = getPreviousPageUrlForCancellationFlow(dealId, defaultPreviousPage);

    // Assert
    expect(response).toBe(`/case/${dealId}/defaultPreviousPage`);
  });

  it('returns the check answers url when status is "change"', () => {
    // Arrange
    const defaultPreviousPage = `/defaultPreviousPage`;
    const status = 'change';

    // Act
    const response = getPreviousPageUrlForCancellationFlow(dealId, defaultPreviousPage, status);

    // Assert
    expect(response).toBe(`/case/${dealId}/cancellation/check-details`);
  });
});
