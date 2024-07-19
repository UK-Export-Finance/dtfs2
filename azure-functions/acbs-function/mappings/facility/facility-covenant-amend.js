/*
  "guaranteeExpiryDate"       Facility cover end date, maps to expirationDate
  "amount"                    Maximum liability when making an amendment, maps to targetAmount
  */

const { produce } = require('immer');
const { z } = require('zod');
const { to2Decimals } = require('../../helpers/currency');

const AmountSchema = z.number().transform((amount) => to2Decimals(amount));

const FacilityGuaranteeDatesSchema = z.object({
  guaranteeExpiryDate: z.string(),
});

const transformFacilityCovenantAmend = ({ amount, facilityGuaranteeDates }) =>
  produce({}, (draft) => {
    if (amount) {
      draft.targetAmount = to2Decimals(amount);
    }
    if (facilityGuaranteeDates?.guaranteeExpiryDate) {
      draft.expirationDate = facilityGuaranteeDates?.guaranteeExpiryDate;
    }
  });

const FacilityCovenantAmendMappingSchema = z
  .object({
    amount: AmountSchema,
    facilityGuaranteeDates: FacilityGuaranteeDatesSchema,
  })
  .partial()
  .refine(({ amount, facilityGuaranteeDates }) => amount || facilityGuaranteeDates, 'Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.')
  .transform(transformFacilityCovenantAmend);

const facilityCovenantAmend = (amendment) => {
  return FacilityCovenantAmendMappingSchema.parse(amendment);
};

module.exports = facilityCovenantAmend;
