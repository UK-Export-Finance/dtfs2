import { DatabaseError } from './database.error';

export class FacilityNotFoundError extends DatabaseError {
  constructor(facilityId?: string) {
    const message = facilityId ? `Facility not found: ${facilityId}` : 'Facility not found';
    super(message);

    this.name = 'FacilityNotFoundError';
  }
}
