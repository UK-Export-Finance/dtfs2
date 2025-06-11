import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class PortalFacilityAmendmentConflictError extends ApiError {
  constructor(facilityId?: string) {
    const message = facilityId
      ? `There is already a portal facility amendment in progress for the given facility ${facilityId}`
      : 'There is already a portal facility amendment in progress for the given facility';
    super({ message, status: HttpStatusCode.Conflict });

    this.name = 'PortalFacilityAmendmentConflictError';
  }
}
