import z from 'zod';

const dealVersionSchema = z.object({
  GEF_DEAL_VERSION: z.preprocess((value) => value ?? 0, z.coerce.number()),
});

export const getDefaultGefDealVersion = () => dealVersionSchema.parse(process.env).GEF_DEAL_VERSION;

const FEATURES = ['FACILITY_END_DATE'] as const;

type Feature = (typeof FEATURES)[number];

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

export const isFacilityEndDateEnabledOnDeal = (version: number) => isGefDealFeatureEnabledOnVersion('FACILITY_END_DATE', version);
