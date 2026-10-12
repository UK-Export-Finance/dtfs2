# APIM GIFT payload mappings

This folder contains mapping utilities that shape TFM data into APIM GIFT payloads.

## Amount rounding rule

All APIM GIFT monetary values produced by these mappers must be rounded to 2 decimal places before being sent.

Use the shared helper:

- `helpers/round-to-2-decimals/index.ts`

Current usages include:

- `amend-facility/index.ts` for `amendmentData.amount`
- `create-facility/map-overview/map-facility-amount/index.ts`
- `create-facility/map-obligations/map-obligation-amount/index.ts`

This avoids floating-point artifacts in payloads (for example, `119999.64000000004`) and keeps APIM GIFT amounts to a maximum of 2 decimal places.
