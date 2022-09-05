const { format } = require('date-fns');

import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import { nowPlusDays } from '../../../support/utils/dateFuncs';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import { MOCK_APPLICATION_AIN } from '../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../fixtures/mock-gef-facilities';
import { DEAL_TYPE, FACILITY_TYPE } from '../../../fixtures/constants';

context('User can view and filter multiple deals', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];

  // one GEF deal
  const MOCK_GEF_DEAL_AIN = MOCK_APPLICATION_AIN;

  // multiple BSS/EWCS deals
  const DEAL_WITH_TEST_SUPPLIER_NAME = createMockDeal({
    status: 'Submitted',
    submissionDetails: { 'supplier-name': 'MY-SUPPLIER' },
  });

  const DEAL_WITH_TEST_MIN_SUBMISSION_TYPE = createMockDeal({
    submissionType: 'Manual Inclusion Notice',
    status: 'Submitted',
  });

  const DEAL_WITH_TEST_BUYER_NAME = createMockDeal({
    status: 'Submitted',
    submissionDetails: { 'buyer-name': 'MY-BUYER' },
  });

  const DEAL_WITH_TEST_MIA_SUBMISSION_TYPE = createMockDeal({
    status: 'Submitted',
    submissionType: 'Manual Inclusion Application',
    testId: 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE',
  });

  const DEAL_WITH_ONLY_1_FACILITY_BOND = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_BOND',
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.BOND),
    ],
  });

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.LOAN),
    ],
  });

  const yesterday = nowPlusDays(-1);

  // NOTE: searching by date queries multiple fields.
  // Therefore we need to set all of these fields to yesterday.
  const DEAL_COMPLETED_YESTERDAY = createMockDeal({
    testId: 'DEAL_COMPLETED_YESTERDAY',
    facilitiesUpdated: yesterday.valueOf().toString(),
  });

  const MOCK_BSS_DEALS = [
    DEAL_WITH_TEST_SUPPLIER_NAME,
    DEAL_WITH_TEST_MIN_SUBMISSION_TYPE,
    DEAL_WITH_TEST_BUYER_NAME,
    DEAL_WITH_TEST_MIA_SUBMISSION_TYPE,
    DEAL_WITH_ONLY_1_FACILITY_BOND,
    DEAL_WITH_ONLY_1_FACILITY_LOAN,
    DEAL_COMPLETED_YESTERDAY,
  ];

  before(() => {
    cy.deleteTfmDeals();

    cy.insertManyDeals(MOCK_BSS_DEALS, MOCK_MAKER_TFM).then((insertedDeals) => {
      insertedDeals.forEach((deal) => {
        const {
          _id: dealId,
          mockFacilities,
        } = deal;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((facilities) => {
          ALL_FACILITIES = [
            ...ALL_FACILITIES,
            ...facilities,
          ];
        });
      });

      cy.submitManyDeals(insertedDeals).then((submittedDeals) => {
        ALL_SUBMITTED_DEALS = submittedDeals;
      });
    });

    cy.insertOneGefDeal(MOCK_GEF_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      const dealId = insertedDeal._id;
      cy.updateGefDeal(dealId, MOCK_GEF_DEAL_AIN, MOCK_MAKER_TFM);

      cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], MOCK_MAKER_TFM);

      cy.submitDeal(dealId, DEAL_TYPE.GEF).then((submittedDeal) => {
        ALL_SUBMITTED_DEALS.push(submittedDeal);
      });
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals'));
  });

  after(() => {
    ALL_FACILITIES.forEach(({ _id }) => {
      cy.deleteFacility(_id, MOCK_MAKER_TFM);
    });
    cy.deleteTfmDeals();
  });

  it('should render all deals by default with correct fields in table', () => {
    const TOTAL_DEALS = ALL_SUBMITTED_DEALS.length;
    pages.dealsPage.dealsTableRows().should('have.length', TOTAL_DEALS);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('All deals');
    });

    // test that one deal has correct fields displayed
    const firstDeal = ALL_SUBMITTED_DEALS[0];
    const row = pages.dealsPage.dealsTable.row(firstDeal._id);

    row.dealLinkText().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.dealSnapshot.details.ukefDealId);
    });

    row.product().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.tfm.product);
    });

    row.submissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.dealSnapshot.submissionType);
    });

    row.exporterName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.dealSnapshot.exporter.companyName);
    });

    row.buyerName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.dealSnapshot.submissionDetails['buyer-name']);
    });

    row.bank().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.dealSnapshot.bank.name);
    });

    row.stage().invoke('text').then((text) => {
      expect(text.trim()).to.contain(firstDeal.tfm.stage);
    });

    const todayFormatted = format(new Date(), 'd MMM yyyy');
    row.dateReceived().invoke('text').then((text) => {
      expect(text.trim()).to.contain(todayFormatted);
    });
  });

  it('search/filter by ukefDealId - BSS/EWCS', () => {
    const aUkefDealId = ALL_SUBMITTED_DEALS[2].dealSnapshot.details.ukefDealId;

    const searchString = aUkefDealId;

    const bssDealsWithUkefDealId = ALL_SUBMITTED_DEALS.filter((d) =>
      d.dealSnapshot.details?.ukefDealId === searchString
      || d.dealSnapshot.ukefDealId === searchString);

    const expectedResultsLength = bssDealsWithUkefDealId.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    if (expectedResultsLength === 1) {
      pages.dealsPage.heading().invoke('text').then((text) => {
        expect(text.trim()).to.equal(`${expectedResultsLength} result for "${searchString}"`);
      });
    } else {
      pages.dealsPage.heading().invoke('text').then((text) => {
        expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
      });
    }
  });

  it('search/filter by ukefDealId - GEF', () => {
    const gefDeal = ALL_SUBMITTED_DEALS.find(({ dealSnapshot }) =>
      dealSnapshot.dealType === DEAL_TYPE.GEF && dealSnapshot.ukefDealId);

    const searchString = gefDeal.dealSnapshot.ukefDealId;

    const expectedResultsLength = 1;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} result for "${searchString}"`);
    });
  });

  it('search/filter by bank name', () => {
    const searchString = 'UKEF test bank';

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    const dealsWithMakerUkefTestBank = ALL_SUBMITTED_DEALS.filter((deal) =>
      deal.dealSnapshot.bank.name.includes(searchString));

    pages.dealsPage.dealsTableRows().should('have.length', dealsWithMakerUkefTestBank.length);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${dealsWithMakerUkefTestBank.length} results for "${searchString}"`);
    });
  });

  it('search/filter by supplier name', () => {
    const searchString = DEAL_WITH_TEST_SUPPLIER_NAME.submissionDetails['supplier-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`1 result for "${searchString}"`);
    });
  });

  it('search/filter by submission type', () => {
    const searchString = DEAL_WITH_TEST_MIN_SUBMISSION_TYPE.submissionType;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`1 result for "${searchString}"`);
    });
  });

  it('search/filter by buyer name', () => {
    const searchString = DEAL_WITH_TEST_BUYER_NAME.submissionDetails['buyer-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`1 result for "${searchString}"`);
    });
  });

  it('search/filter by deal stage', () => {
    // only MIA deals get 'Application' deal stage added.
    // all other deals used in this e2e spec are either AIN or MIN deals.

    const submittedMiaDeal = ALL_SUBMITTED_DEALS.find((deal) =>
      deal.dealSnapshot.testId === 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE'
      && deal.tfm.stage === 'Application');

    const searchString = submittedMiaDeal.tfm.stage;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`1 result for "${searchString}"`);
    });
  });

  it('search/filter by bond productCode', () => {
    const searchString = 'BSS';

    const dealsWithBonds = ALL_SUBMITTED_DEALS.filter((deal) => {
      const { dealSnapshot } = deal;

      if (dealSnapshot.mockFacilities) {
        if (dealSnapshot.mockFacilities.find((f) => f.type === FACILITY_TYPE.BOND)) {
          return deal;
        }
      }
      return null;
    });

    const expectedResultsLength = dealsWithBonds.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('search/filter by loan productCode', () => {
    const searchString = 'EWCS';

    const expectedResultsLength = 1;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} result for "${searchString}"`);
    });
  });

  it('search/filter by date received in DD/MM/YYYY format', () => {
    const todayFormatted = format(new Date(), 'dd/MM/yyyy');

    const searchString = todayFormatted;

    // Note: Date received is generated on submission.
    // all deals in this test are submitted at the same time.
    const expectedResultsLength = ALL_SUBMITTED_DEALS.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('search/filter by date received in DD-MM-YYYY format', () => {
    const todayFormatted = format(new Date(), 'dd-MM-yyyy');

    const searchString = todayFormatted;

    // Note: Date received is generated on submission.
    // all deals in this test are submitted at the same time.
    const expectedResultsLength = ALL_SUBMITTED_DEALS.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('updates heading text and does not render any deals when no results are found', () => {
    const searchString = 'bingo';

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    const expectedResultsLength = 0;

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('after a search has been performed, clicking `All deals` nav item returns all deals ', () => {
    const searchString = DEAL_WITH_TEST_BUYER_NAME.submissionDetails['buyer-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    // click `all deals` link
    partials.primaryNavigation.allDealsLink().click();
    cy.url().should('eq', relative('/deals'));

    const TOTAL_DEALS = ALL_SUBMITTED_DEALS.length;
    pages.dealsPage.dealsTableRows().should('have.length', TOTAL_DEALS);
  });
});
