import { TfmSessionUser } from '@ukef/dtfs2-common';
import { PrimaryNavigationKey } from '@tfm-ui/types/primary-navigation-key';

export type BaseViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
};
