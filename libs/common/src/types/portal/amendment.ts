import z from 'zod';
import { FacilityAmendment, Prettify } from '..';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES, PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID } from '../../schemas';

export type PortalFacilityAmendmentUserValues = z.infer<typeof PORTAL_FACILITY_AMENDMENT_USER_VALUES>;

export type PortalFacilityAmendmentWithUkefId = z.infer<typeof PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID>;

export type FacilityAmendmentWithUkefId = Prettify<FacilityAmendment & { ukefFacilityId: string | null }>;
