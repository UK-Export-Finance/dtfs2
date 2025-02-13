import { ValuesOf } from '..';
import { FACILITY_STAGE } from '../../constants/portal/facility-stage';

/**
 * Type representing the stages of a facility in the portal.
 */
export type PortalFacilityStage = ValuesOf<typeof FACILITY_STAGE>;
