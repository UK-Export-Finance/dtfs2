import { DEAL_STATUS, PORTAL_AMENDMENT_UNDERWAY_STATUSES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { getSubmittedAmendmentDetails } from './submitted-amendment-details';
import { MOCK_AIN_APPLICATION } from './mocks/mock-applications';
import api from '../services/api';

const getAmendmentsOnDealMock = jest.fn();
const userToken = 'test-token';
const application = MOCK_AIN_APPLICATION;
const amendments = [
  { status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, facilityId: 'facility1' },
  { status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, facilityId: 'facility2' },
];

describe('getSubmittedAmendmentDetails', () => {
  beforeEach(() => {
    getAmendmentsOnDealMock.mockResolvedValue(amendments);

    jest.spyOn(api, 'getAmendmentsOnDeal').mockImplementation(getAmendmentsOnDealMock);
  });

  it('should return amendment details when deal is not scheduled or cancelled', async () => {
    const result = await getSubmittedAmendmentDetails(application, userToken);

    expect(result).toEqual({
      portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      facilityIdWithAmendmentUnderway: 'facility1',
      isPortalAmendmentStatusUnderway: PORTAL_AMENDMENT_UNDERWAY_STATUSES.includes(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL),
    });
  });

  it('should return portalAmendmentStatus as null when deal is scheduled or cancelled', async () => {
    application.status = DEAL_STATUS.CANCELLED;
    const result = await getSubmittedAmendmentDetails(application, userToken);

    expect(result).toEqual({
      portalAmendmentStatus: null,
      facilityIdWithAmendmentUnderway: null,
      isPortalAmendmentStatusUnderway: false,
    });
  });
});
