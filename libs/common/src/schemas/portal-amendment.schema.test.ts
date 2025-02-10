import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from './portal-amendment.schema';
import { withSchemaValidationTests } from '../test-helpers';
import { aPortalFacilityAmendmentUserValues } from '../test-helpers/mock-data-backend';
import { PortalFacilityAmendmentUserValues } from '../types';

const aValidPayload = () => JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as PortalFacilityAmendmentUserValues;

describe('PORTAL_FACILITY_AMENDMENT_USER_VALUES', () => {
  withSchemaValidationTests({
    schema: PORTAL_FACILITY_AMENDMENT_USER_VALUES,
    schemaTestOptions: {
      isStrict: true,
    },
    aValidPayload,
    testCases: [
      {
        parameterPath: 'changeCoverEndDate',
        type: 'boolean',
        options: { isOptional: true },
      },
      {
        parameterPath: 'coverEndDate',
        type: 'UNIX_TIMESTAMP_SECONDS_SCHEMA',
        options: { isOptional: true, isNullable: true },
      },
      {
        parameterPath: 'isUsingFacilityEndDate',
        type: 'boolean',
        options: { isOptional: true, isNullable: true },
      },
      {
        parameterPath: 'facilityEndDate',
        type: 'ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA',
        options: { isOptional: true, isNullable: true },
      },
      {
        parameterPath: 'bankReviewDate',
        type: 'ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA',
        options: { isOptional: true, isNullable: true },
      },
      {
        parameterPath: 'changeFacilityValue',
        type: 'boolean',
        options: { isOptional: true },
      },
      {
        parameterPath: 'value',
        type: 'number',
        options: { isOptional: true, isNullable: true },
      },
      { parameterPath: 'currency', type: 'CURRENCY_SCHEMA', options: { isOptional: true } },
    ],
  });
});
