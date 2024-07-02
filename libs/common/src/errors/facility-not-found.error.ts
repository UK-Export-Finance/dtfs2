import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class FacilityNotFoundError extends ApiError {
  constructor(facilityId?: string) {
    const message = facilityId ? `Facility not found: ${facilityId}` : 'Facility not found';
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'FacilityNotFoundError';
  }
}
