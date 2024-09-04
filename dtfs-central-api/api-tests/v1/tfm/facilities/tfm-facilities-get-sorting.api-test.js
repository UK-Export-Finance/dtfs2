import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import getObjectPropertyValueFromStringPath from '../../../../src/utils/getObjectPropertyValueFromStringPath';
import setObjectPropertyValueFromStringPath from '../../../helpers/set-object-property-value-from-string-path';
import { DEALS } from '../../../../src/constants';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';

describe('/v1/tfm/facilities', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/facilities', () => {
    describe('sorts facilities correctly', () => {
      describe.each([
        {
          sortByField: 'ukefFacilityId',
          fieldValuesInAscendingOrder: ['10000001', '10000002', '10000003', '10000004'],
          generateFacilities: generateFacilitiesFromValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForField,
        },
        {
          sortByField: 'tfmFacilities.type',
          fieldValuesInAscendingOrder: [FACILITY_TYPE.BOND, FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT, FACILITY_TYPE.LOAN],
          generateFacilities: generateFacilitiesFromValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForField,
        },
        {
          sortByField: 'tfmFacilities.companyName',
          fieldValuesInAscendingOrder: ['A Company Name', 'B Company Name', 'C Company Name', 'D Company Name'],
          generateFacilities: generateFacilitiesFromCompanyNameValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForField,
        },
        {
          sortByField: 'tfmFacilities.value',
          fieldValuesInAscendingOrder: ['1000', '2000', '3000', '4000'],
          generateFacilities: generateFacilitiesFromValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForField,
        },
        {
          sortByField: 'tfmFacilities.coverEndDate',
          fieldValuesInAscendingOrder: ['2021-08-12T00:00:00.000Z', '2022-08-12T00:00:00.000Z', '2023-08-12T00:00:00.000Z', '2024-08-12T00:00:00.000Z'],
          generateFacilities: generateFacilitiesFromValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForField,
        },
        {
          sortByField: 'facilityStage',
          fieldValuesInAscendingOrder: ['Issued', 'Issued', 'Unissued', 'Unissued'],
          generateFacilities: generateFacilitiesFromFacilityStageValues,
          getFieldPathAndExpectedFieldValues: getFieldPathAndExpectedFieldValuesForFacilityStage,
        },
      ])('by $sortByField', ({ sortByField, fieldValuesInAscendingOrder, generateFacilities, getFieldPathAndExpectedFieldValues }) => {
        const facilities = generateFacilities(fieldValuesInAscendingOrder, sortByField);

        beforeEach(async () => {
          await createAndSubmitFacilities(facilities);
        });

        describe.each(['ascending', 'descending'])('in %s order', (sortByOrder) => {
          const urlWithoutPagination = `/v1/tfm/facilities?sortBy[order]=${sortByOrder}&sortBy[field]=${sortByField}`;

          it('without pagination', async () => {
            const { status, body } = await testApi.get(urlWithoutPagination);

            expect(status).toEqual(200);
            expect(body.facilities.length).toEqual(4);
            expect(body.pagination.totalItems).toEqual(4);
            expect(body.pagination.currentPage).toEqual(0);
            expect(body.pagination.totalPages).toEqual(1);

            const { fieldPath, expectedFieldValues } = getFieldPathAndExpectedFieldValues(fieldValuesInAscendingOrder, sortByOrder, sortByField);

            for (let i = 0; i < 4; i += 1) {
              const fieldValue = getObjectPropertyValueFromStringPath(body.facilities[i], fieldPath);

              expect(fieldValue).toEqual(expectedFieldValues[i]);
            }
          });

          it('with pagination', async () => {
            const pagesize = 2;

            const urlWithPagination = (page) => `${urlWithoutPagination}&pagesize=${pagesize}&page=${page}`;

            const { status: page1Status, body: page1Body } = await testApi.get(urlWithPagination(0));

            const { status: page2Status, body: page2Body } = await testApi.get(urlWithPagination(1));

            expect(page1Status).toEqual(200);
            expect(page1Body.facilities.length).toEqual(2);
            expect(page1Body.pagination.totalItems).toEqual(4);
            expect(page1Body.pagination.currentPage).toEqual(0);
            expect(page1Body.pagination.totalPages).toEqual(2);

            expect(page2Status).toEqual(200);
            expect(page2Body.facilities.length).toEqual(2);
            expect(page2Body.pagination.totalItems).toEqual(4);
            expect(page2Body.pagination.currentPage).toEqual(1);
            expect(page2Body.pagination.totalPages).toEqual(2);

            const { fieldPath, expectedFieldValues } = getFieldPathAndExpectedFieldValues(fieldValuesInAscendingOrder, sortByOrder, sortByField);

            for (let i = 0; i < 2; i += 1) {
              const fieldValue = getObjectPropertyValueFromStringPath(page1Body.facilities[i], fieldPath);

              expect(fieldValue).toEqual(expectedFieldValues[i]);
            }

            for (let i = 0; i < 2; i += 1) {
              const fieldValue = getObjectPropertyValueFromStringPath(page2Body.facilities[i], fieldPath);

              expect(fieldValue).toEqual(expectedFieldValues[i + 2]);
            }
          });
        });
      });
    });
  });

  function newDeal(overrides) {
    return {
      dealType: DEALS.DEAL_TYPE.GEF,
      exporter: { companyName: 'Mock Company name' },
      ...overrides,
    };
  }

  function newFacility(overrides) {
    return {
      ukefFacilityId: '10000001',
      type: FACILITY_TYPE.CASH,
      value: '1000',
      currency: { id: 'GBP' },
      coverEndDate: '2021-08-12T00:00:00.000Z',
      hasBeenIssued: true,
      ...overrides,
    };
  }

  function generateFacilitiesFromValues(values, fieldPath) {
    const fieldPathSplit = fieldPath.split('.');
    const fieldPathExcludingTfmFacilities = fieldPathSplit[fieldPathSplit.length - 1];

    const facilities = [];
    values.forEach((value) => {
      const overrides = {};
      setObjectPropertyValueFromStringPath(overrides, fieldPathExcludingTfmFacilities, value);
      facilities.push({
        facility: newFacility(overrides),
        deal: newDeal({}),
      });
    });
    return facilities;
  }

  function generateFacilitiesFromCompanyNameValues(companyNameValues) {
    const facilities = [];
    companyNameValues.forEach((companyName) => {
      facilities.push({
        facility: newFacility({}),
        deal: newDeal({ exporter: { companyName } }),
      });
    });
    return facilities;
  }

  function generateFacilitiesFromFacilityStageValues(facilityStageValues) {
    const facilities = [];
    facilityStageValues.forEach((facilityStage) => {
      facilities.push({
        facility: newFacility({ hasBeenIssued: facilityStage === 'Issued' }),
        deal: newDeal({}),
      });
    });
    return facilities;
  }

  async function createAndSubmitFacilities(facilities) {
    for (const facilityAndAssociatedDeal of facilities) {
      const { facility, deal } = facilityAndAssociatedDeal;

      const { body: createdDeal } = await testApi.post(deal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      facility.dealId = dealId;
      await testApi.post(facility).to('/v1/portal/gef/facilities');

      await testApi.put({ dealType: deal.dealType, dealId, auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) }).to('/v1/tfm/deals/submit');
    }
  }

  function getFieldPathAndExpectedFieldValuesForField(fieldValuesInAscendingOrder, sortByOrder, sortByField) {
    let expectedFieldValues;
    if (sortByOrder === 'ascending') {
      expectedFieldValues = fieldValuesInAscendingOrder;
    } else {
      expectedFieldValues = fieldValuesInAscendingOrder.slice().reverse();
    }
    return { fieldPath: sortByField, expectedFieldValues };
  }

  function getFieldPathAndExpectedFieldValuesForFacilityStage(fieldValuesInAscendingOrder, sortByOrder) {
    const mapFacilityStageToHasBeenIssued = (facilityStage) => facilityStage === 'Issued';
    let expectedFieldValues;
    if (sortByOrder === 'ascending') {
      expectedFieldValues = fieldValuesInAscendingOrder.map(mapFacilityStageToHasBeenIssued);
    } else {
      expectedFieldValues = fieldValuesInAscendingOrder.slice().reverse().map(mapFacilityStageToHasBeenIssued);
    }
    return { fieldPath: 'tfmFacilities.hasBeenIssued', expectedFieldValues };
  }
});
