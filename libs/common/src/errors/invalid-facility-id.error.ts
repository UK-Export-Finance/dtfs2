import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidFacilityIdError extends ApiError {
  constructor(facilityId?: string) {
    const message = facilityId ? `Invalid facility ID: ${facilityId}` : 'Invalid facility ID';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidFacilityIdError';
  }
}
