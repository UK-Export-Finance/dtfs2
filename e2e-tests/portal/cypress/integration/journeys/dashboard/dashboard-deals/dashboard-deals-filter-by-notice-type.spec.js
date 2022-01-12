const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - filter by submissionType/noticeType', () => {
  const ALL_DEALS = [];

  const BSS_DEAL_DRAFT = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
    bankInternalRefName: 'Draft BSS',
    additionalRefName: 'Tibettan submarine acquisition scheme',
    status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    exporter: {
      companyName: 'mock company',
    },
  };

  const GEF_DEAL_DRAFT = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    bank: { id: BANK1_MAKER1.bank.id },
    bankInternalRefName: 'Draft GEF',
    status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    exporter: {
      companyName: 'mock company',
    },
  };

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('MIA', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      // apply filter
      dashboard.filterCheckboxSubmissionTypeMIA().click();
      dashboard.filtersApplyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      dashboard.filterCheckboxSubmissionTypeMIA().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filtersAppliedContainer().should('be.visible');
      dashboard.filtersAppliedList().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Notice Type');

      const firstAppliedFilter = dashboard.filtersAppliedListItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders only MIA deals', () => {
      const ALL_MIA_DEALS = ALL_DEALS.filter(({ submissionType }) => submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboard.rows().should('have.length', ALL_MIA_DEALS.length);

      const firstMiaDeal = ALL_MIA_DEALS[0];

      dashboard.row.type(firstMiaDeal._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
    });
  });
});
