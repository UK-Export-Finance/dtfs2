import { FacilityAmendment, PortalFacilityAmendment, Prettify } from '..';

export type PortalAmendmentWithUkefId = Prettify<PortalFacilityAmendment & { ukefFacilityId: string | null }>;

export type FacilityAmendmentWithUkefId = Prettify<FacilityAmendment & { ukefFacilityId: string | null }>;
