import z from 'zod';
import { CURRENCY } from '../constants';
import { Currency } from '../types';

/**
 * Portal Amendment schema to validate an object contains only user provided values on `PortalFacilityAmendment`
 */
export const PORTAL_FACILITY_AMENDMENT = z
  .object({
    changeCoverEndDate: z.boolean(),
    coverEndDate: z.number().int().nullable().optional(),
    currentCoverEndDate: z.number().int().nullable().optional(),
    isUsingFacilityEndDate: z.boolean().optional(),
    facilityEndDate: z.date().optional(),
    bankReviewDate: z.date().optional(),
    changeFacilityValue: z.boolean().optional(),
    value: z.number().nullable().optional(),
    currentValue: z.number().nullable().optional(),
    currency: z
      .enum(Object.values(CURRENCY) as [Currency] & Currency[])
      .nullable()
      .optional(),
    ukefExposure: z.number().nullable().optional(),
    coveredPercentage: z.number().optional(),
  })
  .strict();

Object.values(CURRENCY);
