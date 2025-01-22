import z from 'zod';
import { parseISO } from 'date-fns';
import { getEpochMs } from '../helpers';
import { AMENDMENT_TYPES, CURRENCY } from '../constants';
import { Currency, IsoDateTimeStamp } from '../types';
/**
 * Portal Amendment schema to validate an object contains user provided values for the type `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT_USER_VALUES = z
  .object({
    changeCoverEndDate: z.boolean().optional(),
    coverEndDate: z
      .date()
      .transform((date) => getEpochMs(date))
      .optional(),
    currentCoverEndDate: z
      .date()
      .transform((date) => getEpochMs(date))
      .optional(),
    isUsingFacilityEndDate: z.boolean().optional(),
    facilityEndDate: z
      .string()
      .datetime({ offset: true })
      .transform((isoTimestamp: IsoDateTimeStamp) => parseISO(isoTimestamp))
      .optional(),
    bankReviewDate: z
      .string()
      .datetime({ offset: true })
      .transform((isoTimestamp: IsoDateTimeStamp) => parseISO(isoTimestamp))
      .optional(),
    changeFacilityValue: z.boolean().optional(),
    value: z.number().optional(),
    currentValue: z.number().optional(),
    currency: z.enum(Object.values(CURRENCY) as [Currency] & Currency[]).optional(),
    ukefExposure: z.number().optional(),
    coveredPercentage: z.number().optional(),
  })
  .strict();

/**
 * Portal Amendment schema to validate an object contains the correct values for the type `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT = PORTAL_FACILITY_AMENDMENT_USER_VALUES.merge(
  z.object({
    amendmentId: z.string(),
    facilityId: z.string(),
    dealId: z.string(),
    type: z.literal(AMENDMENT_TYPES.PORTAL),
    createdAt: z.number(),
    updatedAt: z.number(),
    status: z.string(),
    createdBy: z
      .object({
        username: z.string(),
        name: z.string(),
        email: z.string().email(),
      })
      .optional(),
  }),
);

export const PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID = PORTAL_FACILITY_AMENDMENT.merge(
  z.object({
    ukefFacilityId: z.string().optional(),
  }),
);
