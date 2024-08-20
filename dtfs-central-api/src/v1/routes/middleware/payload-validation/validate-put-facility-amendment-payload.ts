import z from 'zod';
import { AmendmentStatusSchema, AuditDetailsSchema, CurrencySchema, MongoObjectIdSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema';
import { dateFromIsoStringSchema } from './schemas/dateFromIsoString.schema.ts';

const SubmittedBySchema = z.object({
  _id: MongoObjectIdSchema,
  username: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const PutFacilityAmendmentSchema = z.object({
  payload: z
    .object({
      requestDate: z.number(),
      changeFacilityValue: z.boolean(),
      value: z.number().nullable(),
      currentValue: z.number().nullable(),
      changeCoverEndDate: z.boolean(),
      currentCoverEndDate: z.number().nullable(),
      isUsingFacilityEndDate: z.boolean().nullable(),
      facilityEndDate: dateFromIsoStringSchema.nullable(),
      bankReviewDate: dateFromIsoStringSchema.nullable(),
      ukefExposure: z.number().nullable(),
      coveredPercentage: z.number(),
      currency: CurrencySchema.nullable(),
      status: AmendmentStatusSchema,
      coverEndDate: z.number().nullable(),
      version: z.number(),
      requireUkefApproval: z.boolean(),
      submissionType: z.string(),
      submittedByPim: z.boolean(),
      submittedAt: z.number(),
      submissionDate: z.number(),
      sendFirstTaskEmail: z.boolean(),
      firstTaskEmailSent: z.boolean(),
      effectiveDate: z.number(),
      automaticApprovalEmail: z.boolean(),
      ukefDecision: z
        .object({
          coverEndDate: z.string(),
          value: z.string(),
          conditions: z.string().nullable(),
          declined: z.string().nullable(),
          comments: z.string(),
          submitted: z.boolean(),
          submittedAt: z.number(),
          submittedBy: SubmittedBySchema,
          managersDecisionEmail: z.boolean(),
          managersDecisionEmailSent: z.boolean(),
        })
        .partial(),
      bankDecision: z
        .object({
          decision: z.string(),
          receivedDate: z.number(),
          effectiveDate: z.number().nullable(),
          submitted: z.boolean(),
          banksDecisionEmail: z.boolean(),
          banksDecisionEmailSent: z.boolean(),
          submittedAt: z.number(),
          submittedBy: SubmittedBySchema,
        })
        .partial(),
      createdBy: z.object({
        username: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
      tfm: z
        .object({
          value: z.object({
            value: z.number(),
            currency: CurrencySchema,
          }),
          amendmentExposurePeriodInMonths: z.number().nullable(),
          exposure: z.object({
            exposure: z.union([z.number(), z.string()]),
            timestamp: z.number().nullable(),
            ukefExposureValue: z.number(),
          }),
          coverEndDate: z.number(),
          isUsingFacilityEndDate: z.boolean().nullable(),
          facilityEndDate: dateFromIsoStringSchema.nullable(),
          bankReviewDate: dateFromIsoStringSchema.nullable(),
        })
        .partial(),
      tasks: z.array(
        z.object({
          groupTitle: z.string(),
          id: z.number(),
          groupTasks: z.array(z.any()),
        }),
      ),
      leadUnderwriter: z.object({
        _id: z.union([MongoObjectIdSchema, z.literal('Unassigned')]),
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
      }),
    })
    .partial(),
  auditDetails: AuditDetailsSchema,
});

export type PutFacilityAmendmentPayload = z.infer<typeof PutFacilityAmendmentSchema>;

export const validatePutFacilityAmendmentPayload = createValidationMiddlewareForSchema(PutFacilityAmendmentSchema);
