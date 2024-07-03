import { Request } from 'express';
import { asString, isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

const FACILITY_ID_QUERY_QUERY_PARAMETER_KEY = 'facilityIdQuery';

export const validateFacilityIdQuery = (
  req: Request,
):
  | { validatedFacilityIdQuery: string | undefined; facilityIdQueryError: undefined }
  | { validatedFacilityIdQuery: undefined; facilityIdQueryError: ErrorSummaryViewModel } => {
  const { facilityIdQuery } = req.query;
  const { originalUrl } = req;
  const facilityIdQueryAsString = facilityIdQuery ? asString(facilityIdQuery, FACILITY_ID_QUERY_QUERY_PARAMETER_KEY) : undefined;

  if (
    originalUrl.includes('?') &&
    originalUrl.includes(FACILITY_ID_QUERY_QUERY_PARAMETER_KEY) &&
    (!facilityIdQueryAsString || !isNonEmptyString(facilityIdQueryAsString) || !REGEX.PARTIAL_FACILITY_ID.test(facilityIdQueryAsString))
  ) {
    const facilityIdQueryError = {
      text: 'Enter 4-10 characters of a facility ID',
      href: '#facility-id-filter',
    };

    return { validatedFacilityIdQuery: undefined, facilityIdQueryError };
  }

  return { validatedFacilityIdQuery: facilityIdQueryAsString, facilityIdQueryError: undefined };
};
