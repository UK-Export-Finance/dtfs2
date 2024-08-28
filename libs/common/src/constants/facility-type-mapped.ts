/**
 * @description
 * These are types featured in the mapped facility snapshot in both 'mapGefFacility.js' and 'mapFacility.js',
 * in the file 'mapFacilityType.js'.
 *
 * They are slightly different from the usual facility types and are tech debt.
 *
 * These are subtly different from how we format types for user facing areas (ie bond),
 * and if makinguser facing facility types, a different constant should be used
 */
export const MAPPED_FACILITY_TYPE = {
  // Bond is derived from bondType in these mappers and is deliberately omitted here
  // Loan is identical to facility type, but is provided to avoid confusion
  // if types are ever introduced fully and driven from the constant
  LOAN: 'Loan',
  CASH: 'Cash facility',
  CONTINGENT: 'Contingent facility',
} as const;
