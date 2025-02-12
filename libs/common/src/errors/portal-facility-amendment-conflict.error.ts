import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class PortalFacilityAmendmentConflictError extends ApiError {
  constructor(dealId?: string) {
    const message = dealId
      ? `There is already a portal facility amendment under way on deal ${dealId}`
      : 'There is already a portal facility amendment under way on the deal';
    super({ message, status: HttpStatusCode.Conflict });

    this.name = 'PortalFacilityAmendmentConflictError';
  }
}
