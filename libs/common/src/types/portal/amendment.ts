import z from 'zod';
import { FacilityAmendment, Prettify } from '..';
import { PORTAL_FACILITY_AMENDMENT, PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '../../schemas';

export type PortalFacilityAmendmentUserValues = z.infer<typeof PORTAL_FACILITY_AMENDMENT_USER_VALUES>;

export type PortalFacilityAmendment = z.infer<typeof PORTAL_FACILITY_AMENDMENT>;

export type PortalAmendmentWithUkefId = Prettify<PortalFacilityAmendment & { ukefFacilityId: string | null }>;

export type FacilityAmendmentWithUkefId = Prettify<FacilityAmendment & { ukefFacilityId: string | null }>;
