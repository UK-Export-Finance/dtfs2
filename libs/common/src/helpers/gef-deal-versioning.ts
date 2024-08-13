import z from 'zod';

/**
 * If no version is provided on an existing deal, this is the value that is used.
 */
const DEFAULT_GEF_DEAL_VERSION_NUMBER = 0;

const dealVersionSchema = z.object({
  GEF_DEAL_VERSION: z.preprocess((value) => value ?? DEFAULT_GEF_DEAL_VERSION_NUMBER, z.coerce.number()),
});

export const getCurrentGefDealVersion = () => dealVersionSchema.parse(process.env).GEF_DEAL_VERSION;

/**
 * When adding a new feature, we should add the environment variable here
 * @example
 * type Feature = 'FACILITY_END_DATE' | 'NEW_FEATURE';
 * // ...
 * const minimumSupportedVersions: Record<Feature, number> = {
 *   FACILITY_END_DATE: 1,
 *   NEW_FEATURE: 2,
 * };
 */
type Feature = 'FACILITY_END_DATE';

/**
 * GEF deals are versioned according to what features they include and support
 *
 * | Version number | Features introduced |
 * |----------------|---------------------|
 * | 1              | Facility end date   |
 */
const minimumSupportedVersions: Record<Feature, number> = {
  FACILITY_END_DATE: 1,
};

const isGefDealFeatureEnabledOnVersion = (feature: Feature, version: number): boolean => version >= minimumSupportedVersions[feature];

export const isFacilityEndDateEnabledOnGefVersion = (version: number) => isGefDealFeatureEnabledOnVersion('FACILITY_END_DATE', version);

/**
 * @returns The provided version or DEFAULT_GEF_DEAL_VERSION_NUMBER if undefined
 */
export const parseDealVersion = (version: number | undefined): number => version ?? DEFAULT_GEF_DEAL_VERSION_NUMBER;
