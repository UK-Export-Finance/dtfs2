import { getUnixTime } from 'date-fns';
import { PORTAL_FACILITY_AMENDMENT } from './portal-amendment';
import { withSchemaTests } from '../test-helpers';
import { CURRENCY } from '../constants';

const aValidPayload = () => ({
  changeCoverEndDate: true,
  coverEndDate: getUnixTime(new Date()),
  currentCoverEndDate: getUnixTime(new Date()),
  isUsingFacilityEndDate: true,
  facilityEndDate: getUnixTime(new Date()),
  bankReviewDate: getUnixTime(new Date()),
  changeFacilityValue: true,
  value: 1800,
  currentValue: 1500,
  currency: CURRENCY.GBP,
  ukefExposure: 10,
  coveredPercentage: 23,
});

describe('PORTAL_FACILITY_AMENDMENT', () => {
  withSchemaTests({
    successTestCases: getSuccessTestCases(),
    failureTestCases: getFailureTestCases(),
    schema: PORTAL_FACILITY_AMENDMENT,
  });

  function getSuccessTestCases() {
    return [
      {
        description: 'the payload is valid',
        aTestCase: aValidPayload,
      },
    ];
  }

  function getFailureTestCases() {
    return [
      {
        description: 'amendment is undefined',
        aTestCase: () => undefined,
      },
      {
        description: 'amendment is null',
        aTestCase: () => null,
      },
      {
        description: 'amendment is a number',
        aTestCase: () => 1,
      },
      {
        description: 'amendment is a string',
        aTestCase: () => 'not an object',
      },
      {
        description: 'object contains additional properties',
        aTestCase: () => ({
          ...aValidPayload(),
          extra: 'property',
        }),
      },
      {
        description: 'changeCoverEndDate is a string',
        aTestCase: () => ({
          ...aValidPayload(),
          changeCoverEndDate: 'true',
        }),
      },
      {
        description: 'coverEndDate is not an integer',
        aTestCase: () => ({
          ...aValidPayload(),
          coverEndDate: 'not an integer',
        }),
      },
      {
        description: 'coverEndDate is negative',
        aTestCase: () => ({
          ...aValidPayload(),
          coverEndDate: -42,
        }),
      },
      {
        description: 'currentCoverEndDate is not an integer',
        aTestCase: () => ({
          ...aValidPayload(),
          currentCoverEndDate: 'not an integer',
        }),
      },
      {
        description: 'currentCoverEndDate is negative',
        aTestCase: () => ({
          ...aValidPayload(),
          currentCoverEndDate: -42,
        }),
      },
      {
        description: 'isUsingFacilityEndDate is not a boolean',
        aTestCase: () => ({
          ...aValidPayload(),
          isUsingFacilityEndDate: 'not a boolean',
        }),
      },
      {
        description: 'facilityEndDate is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          facilityEndDate: 'not a number',
        }),
      },
      {
        description: 'facilityEndDate is negative',
        aTestCase: () => ({
          ...aValidPayload(),
          facilityEndDate: -23,
        }),
      },
      {
        description: 'bankReviewDate is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          bankReviewDate: 'not a number',
        }),
      },
      {
        description: 'bankReviewDate is negative',
        aTestCase: () => ({
          ...aValidPayload(),
          bankReviewDate: -23,
        }),
      },
      {
        description: 'changeFacilityValue is not a boolean',
        aTestCase: () => ({
          ...aValidPayload(),
          changeFacilityValue: 'not a boolean',
        }),
      },
      {
        description: 'value is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          value: 'not a number',
        }),
      },
      {
        description: 'currentValue is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          currentValue: 'not a number',
        }),
      },
      {
        description: 'currency is not a valid enum value',
        aTestCase: () => ({
          ...aValidPayload(),
          currency: 'invalid currency',
        }),
      },
      {
        description: 'ukefExposure is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          ukefExposure: 'not a number',
        }),
      },
      {
        description: 'coveredPercentage is not a number',
        aTestCase: () => ({
          ...aValidPayload(),
          coveredPercentage: 'not a number',
        }),
      },
    ];
  }
});
