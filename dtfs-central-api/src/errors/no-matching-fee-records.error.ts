import { ApiError, FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';

export class NoMatchingFeeRecordsError extends ApiError {
  constructor() {
    super({
      status: HttpStatusCode.BadRequest,
      message: `No fee records with '${FEE_RECORD_STATUS.MATCH}' status found`,
    });
  }
}
