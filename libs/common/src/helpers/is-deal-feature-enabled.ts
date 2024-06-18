import z from 'zod';

const dealVersionSchema = z.object({
  GEF_DEAL_VERSION_NUMBER: z.coerce.number(), // TODO: allow undefined
});

// TODO: export this
const defaultGefDealVersion = dealVersionSchema.parse(process.env).GEF_DEAL_VERSION_NUMBER;

const FEATURES = ['FACILITY_END_DATE'] as const;

type Feature = (typeof FEATURES)[number];

// TODO: add documentation here
const minimumSupportedVersions = {
  FACILITY_END_DATE: 1,
} as Record<Feature, number>;

const isGefDealFeatureEnabledOnVersion = (feature: Feature, version: number) => (): boolean => version >= minimumSupportedVersions[feature];

export const isFacilityEndDateEnabledOnDeal = (version: number) => isGefDealFeatureEnabledOnVersion('FACILITY_END_DATE', version);
export const isFacilityEndDateEnabledByDefault = () => isGefDealFeatureEnabledOnVersion('FACILITY_END_DATE', defaultGefDealVersion);
