import { getPreviousAmendmentPageUrl } from './get-previous-page-url';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

const dealId = 'abcdef123456';
const facilityId = '123';
const amendmentId = '456';

describe('getPreviousAmendmentPageUrl', () => {
  const previousPages = Object.values(PORTAL_AMENDMENT_PAGES);

  describe.each(previousPages)('when the provided url is for the %s page', (page) => {
    it('should return the correct relative url, when given a relative URL', () => {
      // Arrange
      const url = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousAmendmentPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });

    it('should return the correct relative url, when given an absolute URL', () => {
      // Arrange
      const url = `www.example.com/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousAmendmentPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });

    it('should return the correct relative url, when given a localhost URL', () => {
      // Arrange
      const url = `localhost:5003//gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

      // Act
      const response = getPreviousAmendmentPageUrl(url, dealId, facilityId, amendmentId);

      // Assert
      expect(response).toEqual(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`);
    });
  });

  it(`should return a URL for ${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE} page if the provided URL is not recognised`, () => {
    // Arrange
    const url = `/gef/application-details/${dealId}/facilities/`;

    // Act
    const response = getPreviousAmendmentPageUrl(url, dealId, facilityId, amendmentId);

    // Assert
    expect(response).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
  });

  it(`should return a URL for ${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE} page if the provided URL is undefined`, () => {
    // Arrange
    const url = undefined;

    // Act
    const response = getPreviousAmendmentPageUrl(url, dealId, facilityId, amendmentId);

    // Assert
    expect(response).toEqual(
      `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
    );
  });
});
