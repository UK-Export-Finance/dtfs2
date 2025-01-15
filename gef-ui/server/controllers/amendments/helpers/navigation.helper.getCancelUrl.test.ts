import { getAmendmentsUrl } from './navigation.helper';

describe('getAmendmentsUrl', () => {
  it('returns the correct cancellation URL using the dealId, facilityId, amendmentId and page', () => {
    // Arrange
    const dealId = 'test-deal-id';
    const facilityId = 'test-facility-id';
    const amendmentId = 'test-amendment-id';
    const page = 'test-page';

    // Arrange
    const expected = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

    expect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page })).toEqual(expected);
  });
});
