import relative from '../../relativeURL';
import { thirtyFiveDaysAgo, today, twentyFiveDaysAgo } from '../../../../../e2e-fixtures/dateConstants';

const { GEF_DEAL_DRAFT } = require('./mocks');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const CONSTANTS = require('../../../fixtures/constants');
const { reports } = require('../../pages');

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Dashboard: Review UKEF Decision report', () => {
  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(
        deal._id,
        {
          ukefDecision: {
            decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
            timestamp: Date.now(),
          },
          submissionDate: new Date().valueOf().toString(),
        },
        BANK1_MAKER1,
      );
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(
        deal._id,
        {
          ukefDecision: {
            decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
            timestamp: Date.now(),
          },
          status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
          submissionDate: new Date().valueOf().toString(),
        },
        BANK1_MAKER1,
      );
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(
        deal._id,
        {
          ukefDecision: {
            decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
            timestamp: twentyFiveDaysAgo.unixMilliseconds,
          },
          status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
          submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
          submissionDate: twentyFiveDaysAgo.unixMilliseconds,
        },
        BANK1_MAKER1,
      );
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, BANK1_MAKER1);
    });
    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(
        deal._id,
        {
          ukefDecision: {
            decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
            timestamp: thirtyFiveDaysAgo.unixMilliseconds,
          },
          status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
          submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
          submissionDate: thirtyFiveDaysAgo.unixMilliseconds,
        },
        BANK1_MAKER1,
      );
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, BANK1_MAKER1);
    });
  });

  describe('Review UKEF decision (Maker)', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative('/reports'));
      cy.saveSession();
    });

    it('returns the reports page with UKEF decisions', () => {
      reports.reportsReviewUkefDecisionTitle().should('contain', 'You need to review 4 UKEF decisions');
      reports.reportsUnconditionalDecision().should('contain', 'Review 2 UKEF decisions');
      reports.reportsConditionalDecision().should('contain', 'Review 2 UKEF decisions');
    });

    it('redirects to the `Manual inclusion application without conditions` reports page', () => {
      reports.reportsUnconditionalDecision().click();
      cy.url().should('eq', relative('/reports/review-unconditional-decision'));
      reports.reportsUnconditionalDecisionBreadcrumbs().should('exist');
      reports.reportsUnconditionalDecisionDownload().should('exist');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="reports-deal-link"]').should('exist');
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '10 days');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', twentyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', twentyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });

    it('redirects to the `Manual inclusion application with conditions` reports page', () => {
      reports.reportsConditionalDecision().click();
      cy.url().should('eq', relative('/reports/review-conditional-decision'));
      reports.reportsConditionalDecisionBreadcrumbs().should('exist');
      reports.reportsConditionalDecisionDownload().should('exist');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="reports-deal-link"]').should('exist');
      cy.get('@row2').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '20 days');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', thirtyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', thirtyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });
  });

  describe('Review UKEF decision (Checker)', () => {
    beforeEach(() => {
      cy.login(BANK1_CHECKER1);
      cy.visit(relative('/reports'));
    });

    it('redirects to the `Manual inclusion application without conditions` reports page', () => {
      reports.reportsUnconditionalDecision().click();
      cy.url().should('eq', relative('/reports/review-unconditional-decision'));
      reports.reportsUnconditionalDecisionBreadcrumbs().should('exist');
      reports.reportsUnconditionalDecisionDownload().should('exist');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="reports-deal-link-text"]').should('exist');
      cy.get('@row2').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '10 days');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', twentyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', twentyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });

    it('redirects to the `Manual inclusion application with conditions` reports page', () => {
      reports.reportsConditionalDecision().click();
      cy.url().should('eq', relative('/reports/review-conditional-decision'));
      reports.reportsConditionalDecisionBreadcrumbs().should('exist');
      reports.reportsConditionalDecisionDownload().should('exist');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="reports-deal-link-text"]').should('exist');
      cy.get('@row2').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '20 days');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', today.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', thirtyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', thirtyFiveDaysAgo.dd_MMM_yyyy);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });
  });
});
