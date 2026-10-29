import zod from 'zod';
import { getEpochMs } from '@ukef/helpers';
import { AMENDMENT_TYPES } from '@ukef/constants';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';
import { CURRENCY_SCHEMA } from './currency.schema';
/**
 * Portal Amendment schema to validate an object contains user provided values for the type `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT_USER_VALUES = zod
  .object({
    changeCoverEndDate: zod.boolean().optional(),
    coverEndDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
    currentCoverEndDate: zod.number().nullable().optional(),
    isUsingFacilityEndDate: zod.boolean().nullable().optional(),
    facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
    bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
    changeFacilityValue: zod.boolean().optional(),
    value: zod.number().nullable().optional(),
    currentValue: zod.number().nullable().optional(),
    currency: CURRENCY_SCHEMA.optional(),
    eligibilityCriteria: z
      .object({
        version: zod.number(),
        criteria: zod.array(
          zod.object({
            id: zod.number(),
            text: zod.string(),
            textList: zod.array(zod.string()).optional(),
            /* When eligibilityCriteria is updated through a patch request with user values, all answers are required */
            answer: zod.boolean(),
          }),
        ),
      })
      .optional(),
    effectiveDate: zod.number().nonnegative().optional(),
    tfm: zod
      .object({
        value: zod
          .object({
            value: zod.number(),
            currency: CURRENCY_SCHEMA,
          })
          .optional(),
        amendmentExposurePeriodInMonths: zod.number().nullable().optional(),
        exposure: zod
          .object({
            exposure: zod.union([zod.number(), zod.string()]),
            timestamp: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable()),
            ukefExposureValue: zod.number(),
          })
          .optional(),
        coverEndDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().optional()),
        facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
        bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
        isUsingFacilityEndDate: zod.boolean().optional(),
      })
      .optional(),
  })
  .strict();

/**
 * Portal Amendment schema to validate an object contains the correct values for the type `PortalFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const PORTAL_FACILITY_AMENDMENT = PORTAL_FACILITY_AMENDMENT_USER_VALUES.merge(
  zod.object({
    amendmentId: zod.string(),
    facilityId: zod.string(),
    dealId: zod.string(),
    type: zod.literal(AMENDMENT_TYPES.PORTAL),
    createdAt: zod.number(),
    updatedAt: zod.number(),
    status: zod.string(),
    createdBy: zod.object({
      username: zod.string(),
      name: zod.string(),
      email: zod.string().email(),
    }),
    eligibilityCriteria: zod.object({
      version: zod.number(),
      criteria: zod.array(
        zod.object({
          id: zod.number(),
          text: zod.string(),
          textList: zod.array(zod.string()).optional(),
          /* When eligibilityCriteria is fetched from the database all the `answer` fields may be null: this is the case before the user has submitted their eligibility responses. */
          answer: zod.boolean().nullable(),
        }),
      ),
    }),
    facilityType: zod.string().optional(),
    tfm: zod.object({
      value: zod
        .object({
          value: zod.number(),
          currency: CURRENCY_SCHEMA,
        })
        .optional(),
      amendmentExposurePeriodInMonths: zod.number().nullable().optional(),
      exposure: z
        .object({
          exposure: zod.union([zod.number(), zod.string()]),
          timestamp: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable()),
          ukefExposureValue: zod.number(),
        })
        .optional(),
      coverEndDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().optional()),
      facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
      bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
      isUsingFacilityEndDate: zod.boolean().optional(),
    }),
  }),
);

export const PORTAL_FACILITY_AMENDMENT_WITH_UKEF_ID = PORTAL_FACILITY_AMENDMENT.merge(
  zod.object({
    ukefFacilityId: zod.string().optional(),
    referenceNumber: zod.string().optional(),
  }),
);
