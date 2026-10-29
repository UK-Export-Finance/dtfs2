import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { AmendmentStatusSchema, AuditDetailsSchema, AllCurrenciesSchema, MongoObjectIdSchema } from './schemas';
import { dateFromIsoStringSchema } from './schemas/dateFromIsoString.schema';

const SubmittedBySchema = zod.object({
  _id: MongoObjectIdSchema,
  username: zod.string(),
  name: zod.string(),
  email: zod.string().email(),
});

const PutFacilityAmendmentSchema = zod.object({
  payload: zod
    .object({
      requestDate: zod.number(),
      changeFacilityValue: zod.boolean(),
      value: zod.number().nullable(),
      currentValue: zod.number().nullable(),
      changeCoverEndDate: zod.boolean(),
      currentCoverEndDate: zod.number().nullable(),
      isUsingFacilityEndDate: zod.boolean().nullable(),
      facilityEndDate: dateFromIsoStringSchema.nullable(),
      bankReviewDate: dateFromIsoStringSchema.nullable(),
      ukefExposure: zod.number().nullable(),
      coveredPercentage: zod.number(),
      currency: AllCurrenciesSchema.nullable(),
      status: AmendmentStatusSchema,
      coverEndDate: zod.number().nullable(),
      version: zod.number(),
      requireUkefApproval: zod.boolean(),
      submissionType: zod.string(),
      submittedByPim: zod.boolean(),
      submittedAt: zod.number(),
      submissionDate: zod.number(),
      sendFirstTaskEmail: zod.boolean(),
      firstTaskEmailSent: zod.boolean(),
      effectiveDate: zod.number(),
      automaticApprovalEmail: zod.boolean(),
      apimGift: zod.object({
        facilityAmendmentSent: zod.boolean(),
      }),
      referenceNumber: zod.string().optional(),
      shouldNotUpdateTimestamp: zod.boolean().optional(),
      ukefDecision: zod
        .object({
          coverEndDate: zod.string(),
          value: zod.string(),
          conditions: zod.string().nullable(),
          declined: zod.string().nullable(),
          comments: zod.string(),
          submitted: zod.boolean(),
          submittedAt: zod.number(),
          submittedBy: SubmittedBySchema,
          managersDecisionEmail: zod.boolean(),
          managersDecisionEmailSent: zod.boolean(),
        })
        .partial(),
      bankDecision: zod
        .object({
          decision: zod.string(),
          receivedDate: zod.number(),
          effectiveDate: zod.number().nullable(),
          submitted: zod.boolean(),
          banksDecisionEmail: zod.boolean(),
          banksDecisionEmailSent: zod.boolean(),
          submittedAt: zod.number(),
          submittedBy: SubmittedBySchema,
        })
        .partial(),
      createdBy: zod.object({
        username: zod.string(),
        name: zod.string(),
        email: zod.string().email(),
      }),
      tfm: zod
        .object({
          value: zod.object({
            value: zod.number(),
            currency: AllCurrenciesSchema,
          }),
          amendmentExposurePeriodInMonths: zod.number().nullable(),
          exposure: zod.object({
            exposure: zod.union([zod.number(), zod.string()]),
            timestamp: zod.number().nullable(),
            ukefExposureValue: zod.number(),
          }),
          coverEndDate: zod.number(),
          isUsingFacilityEndDate: zod.boolean().nullable(),
          facilityEndDate: dateFromIsoStringSchema.nullable(),
          bankReviewDate: dateFromIsoStringSchema.nullable(),
        })
        .partial(),
      tasks: zod.array(
        zod.object({
          groupTitle: zod.string(),
          id: zod.number(),
          groupTasks: zod.array(zod.any()),
        }),
      ),
      leadUnderwriter: zod.object({
        _id: zod.union([MongoObjectIdSchema, zod.literal('Unassigned')]),
        firstName: zod.string().nullable(),
        lastName: zod.string().nullable(),
      }),
    })
    .partial(),
  auditDetails: AuditDetailsSchema,
});

export type PutFacilityAmendmentPayload = zod.infer<typeof PutFacilityAmendmentSchema>;

export const validatePutFacilityAmendmentPayload = validateSchema(PutFacilityAmendmentSchema);
