import z from 'zod';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '../../schemas';

export type PortalFacilityAmendmentUserValues = z.infer<typeof PORTAL_FACILITY_AMENDMENT_USER_VALUES>;
