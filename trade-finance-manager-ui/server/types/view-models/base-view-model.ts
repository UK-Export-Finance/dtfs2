import { PrimaryNavigationKey } from '../primary-navigation-key';
import { TfmSessionUser } from '../tfm-session-user';

export type BaseViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
};
