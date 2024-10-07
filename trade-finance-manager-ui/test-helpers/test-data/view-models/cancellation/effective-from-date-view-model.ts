import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { aTfmSessionUser } from '../../tfm-session-user';
import { EffectiveFromDateViewModel } from '../../../../server/types/view-models';

export const aEffectiveFromDateViewModel = (): EffectiveFromDateViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
  ukefDealId: 'testUkefId',
  dealId: 'testId',
});
