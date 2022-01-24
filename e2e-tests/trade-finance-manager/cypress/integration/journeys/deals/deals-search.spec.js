const { format } = require('date-fns');

import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import { nowPlusDays } from '../../../support/utils/dateFuncs';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import CONSTANTS from '../../../fixtures/constants';

context('User can view and filter multiple deals', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];

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
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === CONSTANTS.FACILITY_TYPE.BOND),
    ],
  });

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === CONSTANTS.FACILITY_TYPE.LOAN),
    ],
  });

  const yesterday = nowPlusDays(-1);

  // NOTE: searching by date queries multiple fields.
  // Therefore we need to set all of these fields to yesterday.
  const DEAL_SUBMITTED_YESTERDAY = createMockDeal({
    testId: 'DEAL_SUBMITTED_YESTERDAY',
    details: {
      submissionDate: yesterday.valueOf().toString(),
    },
    eligibility: {
      lastUpdated: yesterday.valueOf().toString(),
    },
    facilitiesUpdated: yesterday.valueOf().toString(),
  });

  const MOCK_DEALS = [
    DEAL_WITH_TEST_SUPPLIER_NAME,
    DEAL_WITH_TEST_MIN_SUBMISSION_TYPE,
    DEAL_WITH_TEST_BUYER_NAME,
    DEAL_WITH_TEST_MIA_SUBMISSION_TYPE,
    DEAL_WITH_ONLY_1_FACILITY_BOND,
    DEAL_WITH_ONLY_1_FACILITY_LOAN,
    DEAL_SUBMITTED_YESTERDAY,
  ];

  before(() => {
    cy.deleteTfmDeals();

    cy.insertManyDeals(MOCK_DEALS, MOCK_MAKER_TFM)
      .then((insertedDeals) => {
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
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
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

  it('search/filter by ukefDealId', () => {
    const aUkefDealId = ALL_SUBMITTED_DEALS[2].dealSnapshot.details.ukefDealId;

    const searchString = aUkefDealId;

    const dealsWithMockUkefDealId = ALL_SUBMITTED_DEALS.filter((d) =>
      d.dealSnapshot.details.ukefDealId === searchString);

    const expectedResultsLength = dealsWithMockUkefDealId.length;

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

  it('search/filter by bank name', () => {
    const searchString = 'UKEF test bank';

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    const dealsWithMakerTfmBank = ALL_SUBMITTED_DEALS.filter((deal) =>
      deal.dealSnapshot.bank.name.includes(searchString));

    pages.dealsPage.dealsTableRows().should('have.length', dealsWithMakerTfmBank.length);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${dealsWithMakerTfmBank.length} results for "${searchString}"`);
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

    const dealsWithBonds = MOCK_DEALS.filter((deal) => {
      if (deal.mockFacilities.find((f) => f.type === CONSTANTS.FACILITY_TYPE.BOND)) {
        return deal;
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

    const ALL_DEALS_SUBMITTED_TODAY = MOCK_DEALS.filter((deal) => deal.testId !== 'DEAL_SUBMITTED_YESTERDAY');

    const expectedResultsLength = ALL_DEALS_SUBMITTED_TODAY.length;

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

    const ALL_DEALS_SUBMITTED_TODAY = MOCK_DEALS.filter((deal) =>
      deal.testId !== 'DEAL_SUBMITTED_YESTERDAY');

    const expectedResultsLength = ALL_DEALS_SUBMITTED_TODAY.length;

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
