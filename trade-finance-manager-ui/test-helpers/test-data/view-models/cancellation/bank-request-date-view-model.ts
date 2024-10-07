import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { BankRequestDateViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aBankRequestDateViewModel = (): BankRequestDateViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
  ukefDealId: 'testUkefId',
  dealId: 'testId',
  backUrl: 'testBackUrl',
});
