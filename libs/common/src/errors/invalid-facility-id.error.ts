export class InvalidFacilityIdError extends Error {
  constructor(facilityId?: string) {
    const message = facilityId ? `Invalid facility ID: ${facilityId}` : 'Invalid facility ID';
    super(message);

    this.name = 'InvalidFacilityIdError';
  }
}
