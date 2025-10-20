import z from 'zod';
import { getEpochMs } from '../helpers';
import { AMENDMENT_TYPES } from '../constants';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';
import { CURRENCY_SCHEMA } from './currency.schema';

/**
 * Tfm Amendment schema to validate an object contains the correct values for the type `TfmFacilityAmendment`
 *
 * If this schema is changed the Open Api docs should be updated too
 */
export const TFM_FACILITY_AMENDMENT = z.object({
  amendmentId: z.string(),
  facilityId: z.string(),
  dealId: z.string(),
  type: z.literal(AMENDMENT_TYPES.TFM),
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.object({
    username: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
  facilityType: z.string().optional(),
  changeCoverEndDate: z.boolean().optional(),
  currentCoverEndDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
  coverEndDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
  isUsingFacilityEndDate: z.boolean().nullable().optional(),
  facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
  bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.nullable().optional(),
  changeFacilityValue: z.boolean().optional(),
  currentValue: z.number().nullable().optional(),
  value: z.number().nullable().optional(),
  currency: CURRENCY_SCHEMA.optional(),
  effectiveDate: z.number().nonnegative().optional(),
  requestDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
  ukefExposure: z.number().nullable().optional(),
  coveredPercentage: z.number().nullable().optional(),
  requireUkefApproval: z.boolean().nullable().optional(),
  submissionType: z.string().optional(),
  submittedAt: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().optional()),
  submissionDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().optional()),
  status: z.string(),
  version: z.number(),
  submittedByPim: z.boolean().optional(),
  sendFirstTaskEmail: z.boolean().optional(),
  firstTaskEmailSent: z.boolean().optional(),
  automaticApprovalEmail: z.boolean().optional(),
  ukefDecision: z
    .object({
      coverEndDate: z.string().optional(),
      value: z.string().optional(),
      conditions: z.string().nullable().optional(),
      declined: z.string().nullable().optional(),
      comments: z.string().optional(),
      submitted: z.boolean().optional(),
      submittedAt: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
      submittedBy: z
        .object({
          id: z.string(),
          username: z.string(),
          name: z.string(),
          email: z.string(),
        })
        .optional(),
      managersDecisionEmail: z.boolean().optional(),
      managersDecisionEmailSent: z.boolean().optional(),
    })
    .optional(),
  bankDecision: z
    .object({
      decision: z.string().optional(),
      receivedDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative()),
      effectiveDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable().optional()),
      submitted: z.boolean().optional(),
      banksDecisionEmail: z.boolean().optional(),
      banksDecisionEmailSent: z.boolean().optional(),
      submittedAt: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().optional()),
      submittedBy: z
        .object({
          id: z.string(),
          username: z.string(),
          name: z.string(),
          email: z.string(),
        })
        .optional(),
    })
    .optional(),
  tfm: z.object({
    value: z
      .object({
        value: z.number(),
        currency: CURRENCY_SCHEMA,
      })
      .optional(),
    amendmentExposurePeriodInMonths: z.number().nullable().optional(),
    exposure: z
      .object({
        exposure: z.union([z.number(), z.string()]),
        timestamp: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().nullable()),
        ukefExposureValue: z.number(),
      })
      .optional(),
    coverEndDate: z.preprocess((value) => (value instanceof Date ? getEpochMs(value) : value), z.number().int().nonnegative().optional()),
    facilityEndDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
    bankReviewDate: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.optional(),
    isUsingFacilityEndDate: z.boolean().optional(),
  }),
  tasks: z
    .array(
      z.object({
        groupTitle: z.string(),
        id: z.number(),
        groupTasks: z.array(z.any()),
      }),
    )
    .optional(),
  leadUnderwriter: z
    .object({
      _id: z.union([z.string(), z.literal('Unassigned')]),
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
});

export const TFM_FACILITY_AMENDMENT_WITH_UKEF_ID = TFM_FACILITY_AMENDMENT.merge(
  z.object({
    ukefFacilityId: z.string().nullable().optional(),
    referenceNumber: z.string().optional(),
  }),
);
