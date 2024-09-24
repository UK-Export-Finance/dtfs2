import { createMocks } from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { BankRequestDateViewModel } from '../../../types/view-models';
import { getBankRequestDate, GetBankRequestDateRequest } from './bank-request-date.controller';

const dealId = 'dealId';
const mockUser = aTfmSessionUser();

describe('getBankRequestDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders the bank request date page', () => {
    // Arrange
    const { req, res } = createMocks<GetBankRequestDateRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    getBankRequestDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('case/cancellation/bank-request-date.njk');
    expect(res._getRenderData() as BankRequestDateViewModel).toEqual({
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
      user: mockUser,
      ukefDealId: '0040613574', // TODO: DTFS2-7409 get values from database
      dealId,
    });
  });
});
