import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from './portal-amendment';
import { withSchemaTests } from '../test-helpers';
import { aPortalFacilityAmendmentUserValues } from '../test-helpers/mock-data-backend';
import { AnyObject } from '../types';

const aValidPayload = () => JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as AnyObject;

describe('PORTAL_FACILITY_AMENDMENT_USER_VALUES', () => {
  withSchemaTests({
    successTestCases: getSuccessTestCases(),
    failureTestCases: getFailureTestCases(),
    schema: PORTAL_FACILITY_AMENDMENT_USER_VALUES,
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
      {
        description: 'eligibilityCriteria contains a non numerical version value',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: '1', criteria: [] },
        }),
      },
      {
        description: 'eligibilityCriteria is missing version',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { criteria: [] },
        }),
      },
      {
        description: 'eligibilityCriteria is missing criteria',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1 },
        }),
      },
      {
        description: 'eligibility has a non numerical id',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { id: '1', text: 'test-text', answer: true } },
        }),
      },
      {
        description: 'eligibility is missing id',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { text: 'test-text', answer: true } },
        }),
      },
      {
        description: 'eligibility is missing text',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { id: 1, answer: true } },
        }),
      },
      {
        description: 'eligibility is missing answer',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { id: 1, text: 'test-text' } },
        }),
      },
      {
        description: 'eligibility has a non boolean answer',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { id: 1, text: 'test-text', answer: 'true' } },
        }),
      },
      {
        description: 'eligibility has a null answer',
        aTestCase: () => ({
          ...aValidPayload(),
          eligibilityCriteria: { version: 1, eligibility: { id: 1, text: 'test-text', answer: null } },
        }),
      },
    ];
  }

  it('should parse `facilityEndDate` from ISO-8601 into a Date', () => {
    const facilityEndDate = new Date();
    const amendment = {
      facilityEndDate: JSON.parse(JSON.stringify(facilityEndDate)) as string,
    };

    // Act
    const { success, data } = PORTAL_FACILITY_AMENDMENT_USER_VALUES.safeParse(amendment);

    // Assert
    expect(success).toEqual(true);
    expect(data).toEqual({ facilityEndDate });
  });

  it('should parse `bankReviewDate` from ISO-8601 into a Date', () => {
    const bankReviewDate = new Date();
    const amendment = {
      bankReviewDate: JSON.parse(JSON.stringify(bankReviewDate)) as string,
    };

    // Act
    const { success, data } = PORTAL_FACILITY_AMENDMENT_USER_VALUES.safeParse(amendment);

    // Assert
    expect(success).toEqual(true);
    expect(data).toEqual({ bankReviewDate });
  });
});
