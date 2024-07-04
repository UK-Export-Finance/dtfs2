import { ApiError } from '@ukef/dtfs2-common';

export class InvalidIsUsingFacilityEndDate extends ApiError {
  constructor(message: string) {
    super({
      status: 400,
      message,
    });

    this.name = this.constructor.name;
  }
}
