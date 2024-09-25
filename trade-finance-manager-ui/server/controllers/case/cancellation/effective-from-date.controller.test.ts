import { createMocks } from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { getEffectiveFromDate, GetEffectiveFromDateRequest } from './effective-from-date.controller';
import { EffectiveFromDateViewModel } from '../../../types/view-models';

const dealId = 'dealId';
const mockUser = aTfmSessionUser();

describe('getEffectiveFromDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the effective from date page', () => {
    // Arrange
    const { req, res } = createMocks<GetEffectiveFromDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    getEffectiveFromDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('case/cancellation/effective-from-date.njk');
    expect(res._getRenderData() as EffectiveFromDateViewModel).toEqual({
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user: mockUser,
      ukefDealId: '0040613574', // TODO: DTFS2-7417 get values from database
      dealId,
    });
  });
});
