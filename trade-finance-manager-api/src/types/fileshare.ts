import { ValuesOf } from '@ukef/dtfs2-common';
import { FILESHARES } from '../constants';

export type Fileshare = ValuesOf<typeof FILESHARES>;

export type FileshareConfig = {
  FILESHARE_NAME: string;
  STORAGE_ACCOUNT: string;
  STORAGE_ACCESS_KEY: string;
};
