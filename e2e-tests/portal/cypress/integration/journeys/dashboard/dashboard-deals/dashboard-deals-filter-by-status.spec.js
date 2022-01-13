const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const CONTENT_STRINGS = require('../../../../fixtures/content-strings');
const { dashboard } = require('../../../pages');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - filter by status', () => {
  const ALL_DEALS = [];

  const BSS_DEAL_DRAFT = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
    bankInternalRefName: 'Ready for Check BSS',
    additionalRefName: 'Tibettan submarine acquisition scheme',
    status: CONSTANTS.DEALS.DEAL_STATUS.BANK_CHECK,
    exporter: {
      companyName: 'mock company',
    },
  };

  const GEF_DEAL_READY_FOR_CHECK = {
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

    cy.insertOneGefApplication(GEF_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Draft', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      // apply filter
      dashboard.filterCheckboxStatusDraft().click();
      dashboard.filtersApplyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      dashboard.filterCheckboxStatusDraft().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filtersAppliedContainer().should('be.visible');
      dashboard.filtersAppliedList().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filtersAppliedListItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders only draft deals', () => {
      const ALL_DRAFT_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboard.rows().should('have.length', ALL_DRAFT_DEALS.length);

      const firstDraftDeal = ALL_DRAFT_DEALS[0];

      dashboard.row.status(firstDraftDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    });
  });

  describe('Ready for checker', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      // apply filter
      dashboard.filterCheckboxStatusReadyForChecker().click();
      dashboard.filtersApplyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      dashboard.filterCheckboxStatusReadyForChecker().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filtersAppliedContainer().should('be.visible');
      dashboard.filtersAppliedList().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filtersAppliedListItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.BANK_CHECK}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders only Ready for Check deals', () => {
      const ALL_READY_FOR_CHECK_DEALS = ALL_DEALS.filter(({ status }) => status === CONSTANTS.DEALS.DEAL_STATUS.BANK_CHECK);
      dashboard.rows().should('have.length', ALL_READY_FOR_CHECK_DEALS.length);

      const firstReadyToCheckDeal = ALL_READY_FOR_CHECK_DEALS[0];

      dashboard.row.status(firstReadyToCheckDeal._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.BANK_CHECK);
    });
  });

  describe('All statuses', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('submits the filter and redirects to the dashboard', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      // apply filter
      dashboard.filterCheckboxStatusAllStatuses().click();
      dashboard.filtersApplyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('renders checked checkbox', () => {
      // toggle to show filters (hidden by default)
      dashboard.filtersShowHideButton().click();

      dashboard.filterCheckboxStatusAllStatuses().should('be.checked');
    });

    it('renders the applied filter in the `applied filters` section', () => {
      dashboard.filtersAppliedContainer().should('be.visible');
      dashboard.filtersAppliedList().should('be.visible');

      const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Status');

      const firstAppliedFilter = dashboard.filtersAppliedListItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders all deals regardless of status', () => {
      dashboard.rows().should('have.length', ALL_DEALS.length);
    });
  });
});
