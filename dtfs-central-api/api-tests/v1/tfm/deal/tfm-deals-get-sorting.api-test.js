import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { newDeal, createAndSubmitDeals, updateDealsTfm } from './tfm-deals-get.api-test';
import getObjectPropertyValueFromStringPath from '../../../../src/utils/getObjectPropertyValueFromStringPath';
import setObjectPropertyValueFromStringPath from '../../../helpers/set-object-property-value-from-string-path';
import { MOCK_TFM_USER } from '../../../mocks/test-users/mock-tfm-user';

describe('/v1/tfm/deals', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals', () => {
    describe('sorts deals correctly', () => {
      describe.each([
        {
          fieldPathForNonBssDeal: 'dealSnapshot.ukefDealId',
          fieldPathForBssDeal: 'dealSnapshot.details.ukefDealId',
          fieldValuesInAscendingOrder: [null, '10000002', '10000003', '10000004'],
        },
        {
          fieldPathForNonBssDeal: 'dealSnapshot.exporter.companyName',
          fieldPathForBssDeal: 'dealSnapshot.submissionDetails.supplier-name',
          fieldValuesInAscendingOrder: [null, null, 'C Company', 'D Company'],
        },
        {
          fieldPathForNonBssDeal: 'dealSnapshot.buyer.companyName',
          fieldPathForBssDeal: 'dealSnapshot.submissionDetails.buyer-name',
          fieldValuesInAscendingOrder: ['A Company', 'B Company', 'C Company', 'D Company'],
        },
        {
          fieldPathForNonBssDeal: 'dealSnapshot.additionalRefName',
          fieldPathForBssDeal: 'dealSnapshot.additionalRefName',
          fieldValuesInAscendingOrder: ['A Ref Name', 'B Ref Name', 'C Ref Name', 'D Ref Name'],
        },
      ])('by $fieldPathForNonBssDeal', ({ fieldPathForNonBssDeal: nonBssPath, fieldPathForBssDeal: bssPath, fieldValuesInAscendingOrder: values }) => {
        let nonBssPathExcludingDealSnapshot = nonBssPath;
        if (nonBssPath.slice(0, 12) === 'dealSnapshot') {
          nonBssPathExcludingDealSnapshot = nonBssPath.slice(13);
        }

        let bssPathExcludingDealSnapshot = bssPath;
        if (bssPath.slice(0, 12) === 'dealSnapshot') {
          bssPathExcludingDealSnapshot = bssPath.slice(13);
        }

        const gefDeal1Data = { dealType: 'GEF' };
        setObjectPropertyValueFromStringPath(gefDeal1Data, nonBssPathExcludingDealSnapshot, values[0]);
        const gefDeal1 = newDeal(gefDeal1Data);

        const gefDeal2Data = { dealType: 'GEF' };
        setObjectPropertyValueFromStringPath(gefDeal2Data, nonBssPathExcludingDealSnapshot, values[2]);
        const gefDeal2 = newDeal(gefDeal2Data);

        const bssDeal1Data = {};
        setObjectPropertyValueFromStringPath(bssDeal1Data, bssPathExcludingDealSnapshot, values[1]);
        const bssDeal1 = newDeal(bssDeal1Data);

        const bssDeal2Data = {};
        setObjectPropertyValueFromStringPath(bssDeal2Data, bssPathExcludingDealSnapshot, values[3]);
        const bssDeal2 = newDeal(bssDeal2Data);

        beforeEach(async () => {
          await createAndSubmitDeals([gefDeal1, gefDeal2, bssDeal1, bssDeal2]);
        });

        describe.each(['ascending', 'descending'])('in %s order', (order) => {
          const urlWithoutPagination = `/v1/tfm/deals?sortBy[order]=${order}&sortBy[field]=${nonBssPath}`;

          it('without pagination', async () => {
            const { status, body } = await testApi.get(urlWithoutPagination);

            expect(status).toEqual(200);
            expect(body.deals.length).toEqual(4);
            expect(body.pagination.totalItems).toEqual(4);
            expect(body.pagination.currentPage).toEqual(0);
            expect(body.pagination.totalPages).toEqual(1);

            for (let i = 0; i < 4; i += 1) {
              const firstPart = body.deals[order === 'ascending' ? i : 3 - i];
              const secondPart = i % 2 === 0 ? nonBssPath : bssPath;
              const fieldValue = getObjectPropertyValueFromStringPath(firstPart, secondPart);

              const expectedFieldValue = values[i];

              expect(fieldValue).toEqual(expectedFieldValue);
            }
          });

          it('with pagination', async () => {
            const pagesize = 2;

            const urlWithPagination = (page) => `${urlWithoutPagination}&pagesize=${pagesize}&page=${page}`;

            const { status: page1Status, body: page1Body } = await testApi.get(urlWithPagination(0));

            expect(page1Status).toEqual(200);
            expect(page1Body.deals.length).toEqual(2);
            expect(page1Body.pagination.totalItems).toEqual(4);
            expect(page1Body.pagination.currentPage).toEqual(0);
            expect(page1Body.pagination.totalPages).toEqual(2);

            if (order === 'ascending') {
              const firstFieldValue = getObjectPropertyValueFromStringPath(page1Body.deals[0], nonBssPath);
              expect(firstFieldValue).toEqual(values[0]);

              const secondFieldValue = getObjectPropertyValueFromStringPath(page1Body.deals[1], bssPath);
              expect(secondFieldValue).toEqual(values[1]);
            } else {
              const firstFieldValue = getObjectPropertyValueFromStringPath(page1Body.deals[0], bssPath);
              expect(firstFieldValue).toEqual(values[3]);

              const secondFieldValue = getObjectPropertyValueFromStringPath(page1Body.deals[1], nonBssPath);
              expect(secondFieldValue).toEqual(values[2]);
            }

            const { status: page2Status, body: page2Body } = await testApi.get(urlWithPagination(1));

            expect(page2Status).toEqual(200);
            expect(page2Body.deals.length).toEqual(2);
            expect(page2Body.pagination.totalItems).toEqual(4);
            expect(page2Body.pagination.currentPage).toEqual(1);
            expect(page2Body.pagination.totalPages).toEqual(2);

            if (order === 'ascending') {
              const firstFieldValue = getObjectPropertyValueFromStringPath(page2Body.deals[0], nonBssPath);
              expect(firstFieldValue).toEqual(values[2]);

              const secondFieldValue = getObjectPropertyValueFromStringPath(page2Body.deals[1], bssPath);
              expect(secondFieldValue).toEqual(values[3]);
            } else {
              const firstFieldValue = getObjectPropertyValueFromStringPath(page2Body.deals[0], bssPath);
              expect(firstFieldValue).toEqual(values[1]);

              const secondFieldValue = getObjectPropertyValueFromStringPath(page2Body.deals[1], nonBssPath);
              expect(secondFieldValue).toEqual(values[0]);
            }
          });
        });
      });

      describe('by tfm.product', () => {
        // NOTE: deal.tfm is only generated when we update a deal, after deal submission.
        // Therefore we need to do the following in order to test sorting on fields inside deal.tfm:
        // 1) create deals
        // 2) submit deals
        // 3) update deals

        let submittedDeals;
        let submittedDealWith1Bond;
        let submittedDealWith1Loan;
        let submittedDealWithBondAndLoans;

        // create mock deal objects
        const deal1 = newDeal({ details: { ukefDealId: '1-BOND' } });
        const deal2 = newDeal({ details: { ukefDealId: '1-LOAN' } });
        const deal3 = newDeal({ details: { ukefDealId: '1-BOND-1-LOAN' } });

        const deal1TfmUpdate = { product: 'BSS' };
        const deal2TfmUpdate = { product: 'EWCS' };
        const deal3TfmUpdate = { product: 'BSS & EWCS' };

        beforeEach(async () => {
          submittedDeals = await createAndSubmitDeals([deal1, deal3, deal2]);

          submittedDealWith1Bond = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-BOND');
          submittedDealWith1Loan = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-LOAN');
          submittedDealWithBondAndLoans = submittedDeals.find((d) => d.dealSnapshot.details.ukefDealId === '1-BOND-1-LOAN');

          await updateDealsTfm(
            [
              {
                _id: submittedDealWith1Bond._id,
                tfm: deal1TfmUpdate,
              },
              {
                _id: submittedDealWith1Loan._id,
                tfm: deal2TfmUpdate,
              },
              {
                _id: submittedDealWithBondAndLoans._id,
                tfm: deal3TfmUpdate,
              },
            ],
            MOCK_TFM_USER,
          );
        });

        describe.each(['ascending', 'descending'])('in %s order', (order) => {
          const urlWithoutPagination = `/v1/tfm/deals?sortBy[field]=tfm.product&sortBy[order]=${order}`;

          it('without pagination', async () => {
            const expectedDeals = [{ _id: submittedDealWith1Bond?._id }, { _id: submittedDealWithBondAndLoans?._id }, { _id: submittedDealWith1Loan?._id }];

            const { status, body } = await testApi.get(urlWithoutPagination);

            expect(status).toEqual(200);
            expect(body.pagination.totalItems).toEqual(3);
            expect(body.pagination.currentPage).toEqual(0);
            expect(body.pagination.totalPages).toEqual(1);

            const getDealsOnlyIds = body.deals.map((d) => ({
              _id: d._id,
            }));

            expect(getDealsOnlyIds.length).toEqual(expectedDeals.length);

            if (order === 'ascending') {
              expect(getDealsOnlyIds).toEqual(expectedDeals);
            } else {
              expect(getDealsOnlyIds).toEqual(JSON.parse(JSON.stringify(expectedDeals)).reverse());
            }
          });

          it('with pagination', async () => {
            const pagesize = 2;

            const urlWithPagination = (page) => `${urlWithoutPagination}&pagesize=${pagesize}&page=${page}`;

            const expectedDeals = [{ _id: submittedDealWith1Bond?._id }, { _id: submittedDealWithBondAndLoans?._id }, { _id: submittedDealWith1Loan?._id }];

            const { status: page1Status, body: page1Body } = await testApi.get(urlWithPagination(0));

            expect(page1Status).toEqual(200);
            expect(page1Body.deals.length).toEqual(2);
            expect(page1Body.pagination.totalItems).toEqual(3);
            expect(page1Body.pagination.currentPage).toEqual(0);
            expect(page1Body.pagination.totalPages).toEqual(2);

            const getDealsPage1OnlyIds = page1Body.deals.map((d) => ({
              _id: d._id,
            }));

            expect(getDealsPage1OnlyIds.length).toEqual(2);

            if (order === 'ascending') {
              expect(getDealsPage1OnlyIds).toEqual(expectedDeals.slice(0, 2));
            } else {
              expect(getDealsPage1OnlyIds).toEqual(JSON.parse(JSON.stringify(expectedDeals)).reverse().slice(0, 2));
            }

            const { status: page2Status, body: page2Body } = await testApi.get(urlWithPagination(1));

            expect(page2Status).toEqual(200);
            expect(page2Body.deals.length).toEqual(1);
            expect(page2Body.pagination.totalItems).toEqual(3);
            expect(page2Body.pagination.currentPage).toEqual(1);
            expect(page2Body.pagination.totalPages).toEqual(2);

            const getDealsPage2OnlyIds = page2Body.deals.map((d) => ({
              _id: d._id,
            }));

            expect(getDealsPage2OnlyIds.length).toEqual(1);

            if (order === 'ascending') {
              expect(getDealsPage2OnlyIds).toEqual(expectedDeals.slice(2));
            } else {
              expect(getDealsPage2OnlyIds).toEqual(JSON.parse(JSON.stringify(expectedDeals)).reverse().slice(2));
            }
          });
        });
      });
    });
  });
});
