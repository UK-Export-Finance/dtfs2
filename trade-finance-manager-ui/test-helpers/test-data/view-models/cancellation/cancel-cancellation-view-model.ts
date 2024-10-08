import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { CancelCancellationViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aCancelCancellationViewModel = (): CancelCancellationViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
  ukefDealId: 'testUkefId',
  previousPage: 'previousPage',
});
