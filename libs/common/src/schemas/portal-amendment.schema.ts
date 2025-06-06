import z from 'zod';
import { getEpochMs } from '../helpers';
import { AMENDMENT_TYPES } from '../constants';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';
import { CURRENCY_SCHEMA } from './currency.schema';
/**
 * Portal Amendment schema to validate an object contains user provided values for the type `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT_USER_VALUES = z
  .object({
    changeCoverEndDate: z.boolean().optional(),
    coverEndDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
    isUsingFacilityEndDate: z.boolean().nullable().optional(),
    facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
    bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
    changeFacilityValue: z.boolean().optional(),
    value: z.number().nullable().optional(),
    currency: CURRENCY_SCHEMA.optional(),
    eligibilityCriteria: z
      .object({
        version: z.number(),
        criteria: z.array(
          z.object({
            id: z.number(),
            text: z.string(),
            textList: z.array(z.string()).optional(),
            /* When eligibilityCriteria is updated through a patch request with user values, all answers are required */
            answer: z.boolean(),
          }),
        ),
      })
      .optional(),
    effectiveDate: z.number().nonnegative().optional(),
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
    createdBy: z.object({
      username: z.string(),
      name: z.string(),
      email: z.string().email(),
    }),
    eligibilityCriteria: z.object({
      version: z.number(),
      criteria: z.array(
        z.object({
          id: z.number(),
          text: z.string(),
          textList: z.array(z.string()).optional(),
          /* When eligibilityCriteria is fetched from the database all the `answer` fields may be null: this is the case before the user has submitted their eligibility responses. */
          answer: z.boolean().nullable(),
        }),
      ),
    }),
    facilityType: z.string().optional(),
  }),
);

export const PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID = PORTAL_FACILITY_AMENDMENT.merge(
  z.object({
    ukefFacilityId: z.string().optional(),
    referenceNumber: z.string().optional(),
  }),
);
