import relative from '../../relativeURL';
import pages from '../../pages';
import { primaryNavigation } from '../../partials';
import DATE_CONSTANTS from '../../../../../e2e-fixtures/dateConstants';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { FACILITY_TYPE, DEAL_TYPE, ALIAS_KEY } from '../../../fixtures/constants';
import { MOCK_APPLICATION_AIN } from '../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../fixtures/mock-gef-facilities';
import { aliasSelector } from '../../../../../support/alias-selector';

const { format } = require('date-fns');

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
    mockFacilities: [MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.BOND)],
  });

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
    mockFacilities: [MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === FACILITY_TYPE.LOAN)],
  });

  const { yesterday } = DATE_CONSTANTS;

  // NOTE: searching by date queries multiple fields.
  // Therefore we need to set all of these fields to yesterday.
  const DEAL_COMPLETED_YESTERDAY = createMockDeal({
    testId: 'DEAL_COMPLETED_YESTERDAY',
    eligibility: {
      lastUpdated: yesterday.valueOf().toString(),
    },
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

    cy.insertManyDeals(MOCK_BSS_DEALS, BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((deal) => {
        const { _id: dealId, mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((facilities) => {
          ALL_FACILITIES = [...ALL_FACILITIES, ...facilities];
        });
      });

      cy.submitManyDeals(insertedDeals, T1_USER_1);
      cy.get(aliasSelector(ALIAS_KEY.SUBMIT_MANY_DEALS)).then((submittedDeals) => {
        ALL_SUBMITTED_DEALS = submittedDeals;
      });
    });

    cy.insertOneGefDeal(MOCK_GEF_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      const dealId = insertedDeal._id;
      cy.updateGefDeal(dealId, MOCK_GEF_DEAL_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], BANK1_MAKER1);

      cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
      cy.get(aliasSelector(ALIAS_KEY.SUBMIT_DEAL)).then((submittedDeal) => {
        ALL_SUBMITTED_DEALS.push(submittedDeal);
      });
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals/0'));
  });

  after(() => {
    ALL_FACILITIES.forEach(({ _id }) => {
      cy.deleteFacility(_id, BANK1_MAKER1);
    });
    cy.deleteTfmDeals();
  });

  it('should render all deals by default with correct fields in table', () => {
    const TOTAL_DEALS = ALL_SUBMITTED_DEALS.length;
    pages.dealsPage.dealsTableRows().should('have.length', TOTAL_DEALS);

    cy.assertText(pages.dealsPage.heading(), 'All deals');

    // test that one deal has correct fields displayed
    const { _id, dealSnapshot, tfm } = ALL_SUBMITTED_DEALS[0];

    const row = pages.dealsPage.dealsTable.row(_id);

    cy.assertText(row.dealLinkText(), dealSnapshot.details.ukefDealId);
    cy.assertText(row.product(), tfm.product);
    cy.assertText(row.submissionType(), dealSnapshot.submissionType);
    cy.assertText(row.exporterName(), dealSnapshot.exporter.companyName);
    cy.assertText(row.buyerName(), dealSnapshot.submissionDetails['buyer-name']);
    cy.assertText(row.bank(), dealSnapshot.bank.name);
    cy.assertText(row.stage(), tfm.stage);
    cy.assertText(row.dateReceived(), format(new Date(), 'd MMM yyyy'));
  });

  it('search/filter by ukefDealId - BSS/EWCS', () => {
    const aUkefDealId = ALL_SUBMITTED_DEALS[2].dealSnapshot.details.ukefDealId;

    const searchString = aUkefDealId;

    const bssDealsWithUkefDealId = ALL_SUBMITTED_DEALS.filter(
      (d) => d.dealSnapshot.details?.ukefDealId === searchString || d.dealSnapshot.ukefDealId === searchString,
    );

    const expectedResultsLength = bssDealsWithUkefDealId.length;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    if (expectedResultsLength === 1) {
      cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} result for "${searchString}"`);
    } else {
      cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} result for "${searchString}"`);
    }
  });

  it('search/filter by ukefDealId - GEF', () => {
    const gefDeal = ALL_SUBMITTED_DEALS.find(({ dealSnapshot }) => dealSnapshot.dealType === DEAL_TYPE.GEF && dealSnapshot.ukefDealId);

    const searchString = gefDeal.dealSnapshot.ukefDealId;

    const expectedResultsLength = 1;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} result for "${searchString}"`);
  });

  it('search/filter by bank name', () => {
    const searchString = 'UKEF test bank';

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    const dealsWithMakerUkefTestBank = ALL_SUBMITTED_DEALS.filter((deal) => deal.dealSnapshot.bank.name.includes(searchString));

    pages.dealsPage.dealsTableRows().should('have.length', dealsWithMakerUkefTestBank.length);

    cy.assertText(pages.dealsPage.heading(), `${dealsWithMakerUkefTestBank.length} results for "${searchString}"`);
  });

  it('search/filter by supplier name', () => {
    const searchString = DEAL_WITH_TEST_SUPPLIER_NAME.submissionDetails['supplier-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    cy.assertText(pages.dealsPage.heading(), `1 result for "${searchString}"`);
  });

  it('search/filter by submission type', () => {
    const searchString = DEAL_WITH_TEST_MIN_SUBMISSION_TYPE.submissionType;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    cy.assertText(pages.dealsPage.heading(), `1 result for "${searchString}"`);
  });

  it('search/filter by buyer name', () => {
    const searchString = DEAL_WITH_TEST_BUYER_NAME.submissionDetails['buyer-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    cy.assertText(pages.dealsPage.heading(), `1 result for "${searchString}"`);
  });

  it('search/filter by deal stage', () => {
    // only MIA deals get 'Application' deal stage added.
    // all other deals used in this e2e spec are either AIN or MIN deals.

    const submittedMiaDeal = ALL_SUBMITTED_DEALS.find(
      (deal) => deal.dealSnapshot.testId === 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE' && deal.tfm.stage === 'Application',
    );

    const searchString = submittedMiaDeal.tfm.stage;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    cy.assertText(pages.dealsPage.heading(), `1 result for "${searchString}"`);
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
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} results for "${searchString}"`);
  });

  it('search/filter by loan productCode', () => {
    const searchString = 'EWCS';

    const expectedResultsLength = 1;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} result for "${searchString}"`);
  });

  it('search/filter by date received in DD/MM/YYYY format', () => {
    const todayFormatted = format(new Date(), 'dd/MM/yyyy');

    const searchString = todayFormatted;

    // Note: Date received is generated on submission.
    // all deals in this test are submitted at the same time.
    const expectedResultsLength = ALL_SUBMITTED_DEALS.length;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} results for "${searchString}"`);
  });

  it('search/filter by date received in DD-MM-YYYY format', () => {
    const todayFormatted = format(new Date(), 'dd-MM-yyyy');

    const searchString = todayFormatted;

    // Note: Date received is generated on submission.
    // all deals in this test are submitted at the same time.
    const expectedResultsLength = ALL_SUBMITTED_DEALS.length;

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} results for "${searchString}"`);
  });

  it('updates heading text and does not render any deals when no results are found', () => {
    const searchString = 'bingo';

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    const expectedResultsLength = 0;

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    cy.assertText(pages.dealsPage.heading(), `${expectedResultsLength} results for "${searchString}"`);
  });

  it('after a search has been performed, clicking `All deals` nav item returns all deals ', () => {
    const searchString = DEAL_WITH_TEST_BUYER_NAME.submissionDetails['buyer-name'];

    pages.dealsPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    pages.dealsPage.dealsTableRows().should('have.length', 1);

    // click `all deals` link
    primaryNavigation.allDealsLink().click();
    cy.url().should('eq', relative('/deals/0'));

    const TOTAL_DEALS = ALL_SUBMITTED_DEALS.length;
    pages.dealsPage.dealsTableRows().should('have.length', TOTAL_DEALS);
  });
});
