import { PortalAmendmentStatus } from './amendment-status';
import { Facility } from './mongo-db-models';

export type SubmittedAmendmentDetails = {
  portalAmendmentStatus: PortalAmendmentStatus;
  facilityIdWithAmendmentInProgress: Facility;
  isPortalAmendmentInProgress: boolean;
};
