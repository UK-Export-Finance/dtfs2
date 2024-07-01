import { Request } from 'express';
import { asString, isNonEmptyString } from '@ukef/dtfs2-common';
import { ErrorSummaryViewModel } from '../../../types/view-models';
import { REGEX } from '../../../constants';

export const validateFacilityIdQuery = (
  req: Request,
): {
  validatedFacilityIdQuery: string | undefined;
  facilityIdQueryError: ErrorSummaryViewModel | undefined;
} => {
  const { facilityIdQuery } = req.query;
  const { originalUrl } = req;
  const facilityIdQueryAsString = facilityIdQuery ? asString(facilityIdQuery, 'facilityIdQuery') : undefined;
  let facilityIdQueryError: ErrorSummaryViewModel | undefined;

  if (
    originalUrl.includes('?') &&
    (!facilityIdQueryAsString || !isNonEmptyString(facilityIdQueryAsString) || !REGEX.PARTIAL_FACILITY_ID.test(facilityIdQueryAsString))
  ) {
    facilityIdQueryError = {
      text: 'Enter 4-10 characters of a facility ID',
      href: '#facility-id-filter',
    };
  }

  return { validatedFacilityIdQuery: facilityIdQueryAsString, facilityIdQueryError };
};
