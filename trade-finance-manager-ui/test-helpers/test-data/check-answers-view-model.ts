import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';
import { aTfmSessionUser } from './tfm-session-user';
import { CheckDetailsViewModel } from '../../server/types/view-models';

export const aCheckDetailsViewModel = (): CheckDetailsViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
  ukefDealId: 'testUkefId',
  dealId: 'testId',
  cancellation: { reason: 'a reason', effectiveFrom: 1729007392441, bankRequestDate: 1729007392441 },
});
