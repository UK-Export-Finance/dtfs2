const { DEAL_STATUS } = require('@ukef/dtfs2-common');
const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONTENT_STRINGS = require('../../../../../fixtures/content-strings');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { BSS_DEAL_READY_FOR_CHECK, GEF_DEAL_DRAFT, BSS_DEAL_CANCELLED } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const { ALL_STATUSES } = CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES;
const statusCheckboxSelectors = dashboardDeals.filters.panel.form.status;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by status', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_CANCELLED, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Status filters', () => {
    const statusesToTest = [
      {
        status: DEAL_STATUS.DRAFT,
        label: 'Draft',
        checkboxSelector: statusCheckboxSelectors.draft,
      },
      {
        status: DEAL_STATUS.READY_FOR_APPROVAL,
        label: 'Ready-for-Checkers-approval',
        checkboxSelector: statusCheckboxSelectors.readyForChecker,
      },
      {
        status: DEAL_STATUS.CANCELLED,
        label: 'Cancelled',
        checkboxSelector: statusCheckboxSelectors.cancelled,
      },
      {
        status: ALL_STATUSES,
        label: 'All-statuses',
        checkboxSelector: statusCheckboxSelectors.all,
      },
    ];

    statusesToTest.forEach(({ status, label, checkboxSelector }) => {
      describe(status, () => {
        before(() => {
          cy.login(BANK1_MAKER1);
          dashboardDeals.visit();
          cy.url().should('eq', relative('/dashboard/deals/0'));
        });

        beforeEach(() => {
          cy.saveSession();
          dashboardDeals.visit();

          // toggle to show filters (hidden by default)
          filters.showHideButton().click();
        });

        it('submits the filter and redirects to the dashboard', () => {
          // apply filter
          checkboxSelector.checkbox().click();
          filters.panel.form.applyFiltersButton().click();

          cy.url().should('eq', relative('/dashboard/deals/0'));
        });

        it('renders checked checkbox', () => {
          checkboxSelector.checkbox().should('be.checked');
        });

        it('renders the applied filter in the `applied filters` section', () => {
          filters.panel.selectedFilters.container().should('be.visible');
          filters.panel.selectedFilters.list().should('be.visible');

          const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

          firstAppliedFilterHeading.should('be.visible');
          cy.assertText(firstAppliedFilterHeading, 'Status');

          const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

          firstAppliedFilter.should('be.visible');
          const expectedText = `Remove this filter ${status}`;
          cy.assertText(firstAppliedFilter, expectedText);
        });

        it('renders the applied filter in the `main container selected filters` section', () => {
          cy.get(`[data-cy=main-container-selected-filter-${label}`).should('be.visible');

          const expectedText = `Remove this filter ${status}`;
          cy.get(`[data-cy=main-container-selected-filter-${label}`).contains(expectedText);
        });

        if (status === ALL_STATUSES) {
          it('renders all deals regardless of status', () => {
            dashboardDeals.rows().should('have.length', ALL_DEALS.length);
          });
        } else {
          it(`renders only ${status} deals`, () => {
            const expectedDeals = ALL_DEALS.filter(({ status: dealStatus }) => dealStatus === status);
            dashboardDeals.rows().should('have.length', expectedDeals.length);

            const firstExpectedDeal = expectedDeals[0];

            cy.assertText(dashboardDeals.row.status(firstExpectedDeal._id), status);
          });
        }
      });
    });
  });
});
