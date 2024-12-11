import { FacilityAmendment, Prettify } from '..';

export type FacilityAmendmentWithUkefId = Prettify<FacilityAmendment & { ukefFacilityId: string | null }>;
