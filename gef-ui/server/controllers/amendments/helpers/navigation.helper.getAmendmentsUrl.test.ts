import { getAmendmentsUrl } from './navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';

const { CANCEL, WHAT_DO_YOU_NEED_TO_CHANGE, FACILITY_VALUE } = PORTAL_AMENDMENT_PAGES;

describe('getAmendmentsUrl', () => {
  const testPages = [CANCEL, WHAT_DO_YOU_NEED_TO_CHANGE, FACILITY_VALUE];

  it.each(testPages)('should return the correct cancellation URL using the dealId, facilityId, amendmentId when the page is %s', (page) => {
    // Arrange
    const dealId = 'test-deal-id';
    const facilityId = 'test-facility-id';
    const amendmentId = 'test-amendment-id';

    // Arrange
    const expected = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${page}`;

    expect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page })).toEqual(expected);
  });
});
