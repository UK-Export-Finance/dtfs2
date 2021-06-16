import moment from 'moment';
import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and filter multiple deals', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];

  const DEAL_WITH_TEST_SUPPLIER_NAME = createMockDeal({
    details: { status: 'Submitted' },
    submissionDetails: { 'supplier-name': 'MY-SUPPLIER' },
  });

  const DEAL_WITH_TEST_MIN_SUBMISSION_TYPE = createMockDeal({
    details: {
      status: 'Submitted',
      submissionType: 'Manual Inclusion Notice',
    },
  });

  const DEAL_WITH_TEST_BUYER_NAME = createMockDeal({
    details: { status: 'Submitted' },
    submissionDetails: { 'buyer-name': 'MY-BUYER' },
  });

  const DEAL_WITH_TEST_MIA_SUBMISSION_TYPE = createMockDeal({
    details: {
      testUkefDealId: 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE',
      status: 'Submitted',
      submissionType: 'Manual Inclusion Application',
    },
  });

  const DEAL_WITH_ONLY_1_FACILITY_BOND = createMockDeal({
    details: {
      testUkefDealId: 'DEAL_WITH_ONLY_1_FACILITY_BOND',
    },
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.facilityType === 'bond'),
    ],
  });

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal({
    details: {
      testUkefDealId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
    },
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.facilityType === 'loan'),
    ],
  });

  const yesterday = moment().subtract(1, 'day');

  const DEAL_SUBMITTED_YESTERDAY = createMockDeal({
    details: {
      testUkefDealId: 'DEAL_SUBMITTED_YESTERDAY',
      submissionDate: moment(yesterday).utc().valueOf().toString(),
    },
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
    ALL_FACILITIES.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
    cy.deleteTfmDeals();
  });

  it('should render all deals by default', () => {
    const TOTAL_DEALS = ALL_SUBMITTED_DEALS.length;
    pages.dealsPage.dealsTableRows().should('have.length', TOTAL_DEALS);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal('All deals');
    });
  });

  it('search/filter by ukefDealId', () => {
    // all mock deals have the same ukefDealId.
    // changing this causes estore API call to fail.
    const mockUkefDealId = MOCK_DEAL_AIN.details.ukefDealId;

    const searchString = mockUkefDealId;

    const dealsWithMockUkefDealId = ALL_SUBMITTED_DEALS.filter((d) =>
      d.dealSnapshot.details.ukefDealId === mockUkefDealId);

    const expectedResultsLength = dealsWithMockUkefDealId.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('search/filter by bank name', () => {
    // in this e2e test, all deals have the same bank name. When deal is created,
    // deal.details.owningBank is generated from the maker/user profile.
    const makerTfmBankName = MOCK_MAKER_TFM.bank.name;
    const bankNamePartialString = 'UKEF test bank';

    const searchString = bankNamePartialString;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    const dealsWithMakerTfmBank = ALL_SUBMITTED_DEALS.filter((deal) =>
      deal.dealSnapshot.details.owningBank.name === makerTfmBankName);

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
    const searchString = DEAL_WITH_TEST_MIN_SUBMISSION_TYPE.details.submissionType;

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
      deal.dealSnapshot.details.testUkefDealId === 'DEAL_WITH_TEST_MIA_SUBMISSION_TYPE'
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
      if (deal.mockFacilities.find((f) => f.facilityType === 'bond')) {
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

    const dealsWithLoans = MOCK_DEALS.filter((deal) => {
      if (deal.mockFacilities.find((f) => f.facilityType === 'loan')) {
        return deal;
      }
      return null;
    });

    const expectedResultsLength = dealsWithLoans.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('search/filter by date received in DD/MM/YYYY format', () => {
    const todayFormatted = moment().format('DD/MM/YYYY');

    const searchString = todayFormatted;

    const ALL_DEALS_SUBMITTED_TODAY = MOCK_DEALS.filter((deal) =>
      deal.details.testUkefDealId !== 'DEAL_SUBMITTED_YESTERDAY');

    const expectedResultsLength = ALL_DEALS_SUBMITTED_TODAY.length;

    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', expectedResultsLength);

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedResultsLength} results for "${searchString}"`);
    });
  });

  it('search/filter by date received in DD-MM-YYYY format', () => {
    const todayFormatted = moment().format('DD-MM-YYYY');

    const searchString = todayFormatted;

    const ALL_DEALS_SUBMITTED_TODAY = MOCK_DEALS.filter((deal) =>
      deal.details.testUkefDealId !== 'DEAL_SUBMITTED_YESTERDAY');

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
