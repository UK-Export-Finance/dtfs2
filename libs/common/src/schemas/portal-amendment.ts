import z from 'zod';
import { CURRENCY } from '../constants';
import { Currency } from '../types';
import { UNIX_TIMESTAMP_SECONDS_SCHEMA } from './unix-timestamp.schema';

/**
 * Portal Amendment schema to validate an object contains only user provided values on `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT = z
  .object({
    changeCoverEndDate: z.boolean(),
    coverEndDate: UNIX_TIMESTAMP_SECONDS_SCHEMA.optional(),
    currentCoverEndDate: UNIX_TIMESTAMP_SECONDS_SCHEMA.optional(),
    isUsingFacilityEndDate: z.boolean().optional(),
    facilityEndDate: UNIX_TIMESTAMP_SECONDS_SCHEMA.optional(),
    bankReviewDate: UNIX_TIMESTAMP_SECONDS_SCHEMA.optional(),
    changeFacilityValue: z.boolean().optional(),
    value: z.number().optional(),
    currentValue: z.number().optional(),
    currency: z.enum(Object.values(CURRENCY) as [Currency] & Currency[]).optional(),
    ukefExposure: z.number().optional(),
    coveredPercentage: z.number().optional(),
  })
  .strict();

Object.values(CURRENCY);
