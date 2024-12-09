import { TfmSessionUser } from '@ukef/dtfs2-common';
import { PrimaryNavigationKey } from '../primary-navigation-key';

export type BaseViewModel = {
  user: TfmSessionUser;
  activePrimaryNavigation: PrimaryNavigationKey;
};
