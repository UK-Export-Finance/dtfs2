import { PORTAL_AMENDMENT_STATUS, TFM_AMENDMENT_STATUS } from '@ukef/constants/amendments';
import { ValuesOf } from './types-helper';

export type TfmAmendmentStatus = ValuesOf<typeof TFM_AMENDMENT_STATUS>;

export type PortalAmendmentStatus = ValuesOf<typeof PORTAL_AMENDMENT_STATUS>;
