import { getPreviousPageUrl } from './get-previous-page-url';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

const dealId = 'abcdef123456';
const facilityId = '123';
const amendmentId = '456';

describe('getPreviousPageUrlForCancelCancellation', () => {
  const previousPages = Object.values(PORTAL_AMENDMENT_PAGES);

  describe.each(previousPages)('when the provided url is for the %s page', (page) => {
    it('returns the correct relative url, when given a relative URL', () => {
      // Arrange
      const url = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });

    it('returns the correct relative url, when given an absolute URL', () => {
      // Arrange
      const url = `www.example.com/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });

    it('returns the correct relative url, when given a localhost URL', () => {
      // Arrange
      const url = `localhost:5003//gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });
  });

  it('returns a URL for the deal summary page if the provided URL is not recognised', () => {
    // Arrange
    const url = `/gef/application-details/${dealId}/facilities/`;

    // Act
    const response = getPreviousPageUrl(url, dealId, facilityId, amendmentId);

    // Assert
    expect(response).toEqual(`/gef/application-details/${dealId}`);
  });
});
