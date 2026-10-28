import { FACILITY_STAGE } from '@ukef/constants/portal/facility-stage';
import { ValuesOf } from '..';

/**
 * Type representing the stages of a facility in the portal.
 */
export type PortalFacilityStage = ValuesOf<typeof FACILITY_STAGE>;
