import zod from 'zod';
import { getEpochMs } from '@ukef/helpers';
import { AMENDMENT_TYPES } from '@ukef/constants';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';
import { CURRENCY_SCHEMA } from './currency.schema';

/**
 * Tfm Amendment schema to validate an object contains the correct values for the type `TfmFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const TFM_FACILITY_AMENDMENT = zod.object({
  amendmentId: zod.string(),
  facilityId: zod.string(),
  dealId: zod.string(),
  type: zod.literal(AMENDMENT_TYPES.TFM),
  createdAt: zod.number(),
  updatedAt: zod.number(),
  createdBy: zod.object({
    username: zod.string(),
    name: zod.string(),
    email: zod.string().email(),
  }),
  facilityType: zod.string().optional(),
  changeCoverEndDate: zod.boolean().optional(),
  currentCoverEndDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
  coverEndDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
  isUsingFacilityEndDate: zod.boolean().nullable().optional(),
  facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
  bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
  changeFacilityValue: zod.boolean().optional(),
  currentValue: zod.number().nullable().optional(),
  value: zod.number().nullable().optional(),
  currency: CURRENCY_SCHEMA.optional(),
  effectiveDate: zod.number().nonnegative().optional(),
  requestDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
  ukefExposure: zod.number().nullable().optional(),
  coveredPercentage: zod.number().nullable().optional(),
  requireUkefApproval: zod.boolean().nullable().optional(),
  submissionType: zod.string().optional(),
  submittedAt: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().optional()),
  submissionDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().optional()),
  status: zod.string(),
  version: zod.number(),
  submittedByPim: zod.boolean().optional(),
  sendFirstTaskEmail: zod.boolean().optional(),
  firstTaskEmailSent: zod.boolean().optional(),
  automaticApprovalEmail: zod.boolean().optional(),
  ukefDecision: zod
    .object({
      coverEndDate: zod.string().optional(),
      value: zod.string().optional(),
      conditions: zod.string().nullable().optional(),
      declined: zod.string().nullable().optional(),
      comments: zod.string().optional(),
      submitted: zod.boolean().optional(),
      submittedAt: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
      submittedBy: zod
        .object({
          id: zod.string(),
          username: zod.string(),
          name: zod.string(),
          email: zod.string(),
        })
        .optional(),
      managersDecisionEmail: zod.boolean().optional(),
      managersDecisionEmailSent: zod.boolean().optional(),
    })
    .optional(),
  bankDecision: zod
    .object({
      decision: zod.string().optional(),
      receivedDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative()),
      effectiveDate: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().nullable().optional()),
      submitted: zod.boolean().optional(),
      banksDecisionEmail: zod.boolean().optional(),
      banksDecisionEmailSent: zod.boolean().optional(),
      submittedAt: zod.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), zod.number().int().nonnegative().optional()),
      submittedBy: zod
        .object({
          id: zod.string(),
          username: zod.string(),
          name: zod.string(),
          email: zod.string(),
        })
        .optional(),
    })
    .optional(),
  tfm: zod.object({
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
  }),
  tasks: zod
    .array(
      zod.object({
        groupTitle: zod.string(),
        id: zod.number(),
        groupTasks: zod.array(zod.any()),
      }),
    )
    .optional(),
  leadUnderwriter: zod
    .object({
      _id: zod.union([zod.string(), zod.literal('Unassigned')]),
      firstName: zod.string(),
      lastName: zod.string(),
    })
    .optional(),
});

export const TFM_FACILITY_AMENDMENT_WITH_UKEF_ID = TFM_FACILITY_AMENDMENT.merge(
  zod.object({
    ukefFacilityId: zod.string().nullable().optional(),
    referenceNumber: zod.string().optional(),
  }),
);
