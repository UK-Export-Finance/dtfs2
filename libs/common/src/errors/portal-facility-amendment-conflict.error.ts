import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class PortalFacilityAmendmentConflictError extends ApiError {
  constructor(facilityId?: string) {
    const message = facilityId
      ? `There is already a portal facility amendment under way on the facility ${facilityId}`
      : 'There is already a portal facility amendment under way on the facility';
    super({ message, status: HttpStatusCode.Conflict });

    this.name = 'PortalFacilityAmendmentConflictError';
  }
}
