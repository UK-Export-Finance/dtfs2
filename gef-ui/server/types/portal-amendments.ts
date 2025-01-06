import { Prettify, ValuesOf } from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_PAGES } from '../constants/amendments';

export type PortalAmendmentPage = Prettify<ValuesOf<typeof PORTAL_AMENDMENT_PAGES>>;
