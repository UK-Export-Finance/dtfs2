/**
 * These are types featured in the mapped facility snapshot in both 'mapGefFacility.js' and 'mapFacility.js',
 * in the file 'mapFacilityType.js'.
 *
 * They are slightly different from the usual facility types and are tech debt.
 * They should not be introduced anywhere else.
 *
 * These types are subtly different from how we format types for user facing areas (ie bonds are formatted differently),
 * and if making user facing facility types, this constant should not be used.
 */

export const MAPPED_GEF_FACILITY_TYPE = {
  CASH: 'Cash facility',
  CONTINGENT: 'Contingent facility',
} as const;

export const MAPPED_FACILITY_TYPE = {
  // Bond is derived from bondType in these mappers and
  // is deliberately omitted here as it cannot be determined due to lacking bondType constants
  // Loan is identical to facility type, but is provided to avoid confusion if
  // types are ever introduced fully and need to use this constant
  LOAN: 'Loan',
  ...MAPPED_GEF_FACILITY_TYPE,
} as const;
