import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class AmendmentNotCreatedError extends ApiError {
  constructor(facilityId?: string) {
    const message = facilityId ? `Amendment not created for facility: ${facilityId}` : 'Amendment not created';
    super({ message, status: HttpStatusCode.UnprocessableEntity }); // This status code is used to maintain consistency with the existing implimentation

    this.name = 'AmendmentNotCreatedError';
  }
}
