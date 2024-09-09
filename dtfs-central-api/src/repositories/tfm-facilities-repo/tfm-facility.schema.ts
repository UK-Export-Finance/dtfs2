import z from 'zod';
import { MongoObjectIdSchema } from '../../v1/routes/middleware/payload-validation/schemas';

const TfmFacilityDateFieldSchema = z
  .object({
    $date: z.coerce.date(),
  })
  .nullable();

/**
 * This schema is an incomplete schema for the TFM facilities
 * collection which should be updated as and when new properties
 * are needed.
 */
export const TfmFacilitySchema = z.object({
  _id: MongoObjectIdSchema,
  facilitySnapshot: z.object({
    _id: MongoObjectIdSchema,
    dealId: MongoObjectIdSchema,
    type: z.string(),
    hasBeenIssued: z.boolean(),
    name: z.string(),
    shouldCoverStartOnSubmission: z.boolean(),
    coverStartDate: TfmFacilityDateFieldSchema,
    coverEndDate: TfmFacilityDateFieldSchema,
    issueDate: TfmFacilityDateFieldSchema,
    monthsOfCover: z.number().nullable(),
    details: z.array(z.string()),
    detailsOther: z.string(),
    value: z.number(),
    coverPercentage: z.number(),
    interestPercentage: z.number(),
    ukefFacilityId: z.string(),
    dayCountBasis: z.number(),
  }),
});
