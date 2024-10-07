import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { ReasonForCancellingViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aReasonForCancellingViewModel = (): ReasonForCancellingViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
  ukefDealId: 'testUkefId',
  dealId: 'testId',
  backUrl: 'testBackUrl',
});
