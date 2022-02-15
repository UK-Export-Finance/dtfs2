import { format, sub, getUnixTime } from 'date-fns';
import relative from '../../relativeURL';

const { GEF_DEAL_DRAFT } = require('./mocks');
const MOCK_USERS = require('../../../fixtures/users');
const CONSTANTS = require('../../../fixtures/constants');
const { reports } = require('../../pages');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Dashboard: Review UKEF Decision report', () => {
  const todayAtMidnight = (new Date(parseInt(Date.now(), 10))).setHours(0, 0, 1, 0);
  let daysInThePast = sub(todayAtMidnight, { days: 25 });
  const dateCreated = format(todayAtMidnight, 'dd LLL yyyy');
  let submissionDate = format(todayAtMidnight, 'dd LLL yyyy');
  let dateOfApproval = format(todayAtMidnight, 'dd LLL yyyy');
  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(deal._id, {
        ukefDecision: {
          decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, timestamp: Date.now(),
        },
        submissionDate: new Date().valueOf().toString(),
      }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(deal._id, {
        ukefDecision: {
          decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, timestamp: Date.now(),
        },
        status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
        submissionDate: new Date().valueOf().toString(),
      }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      cy.updateGefApplication(deal._id, {
        ukefDecision: {
          decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, timestamp: getUnixTime(daysInThePast) * 1000,
        },
        status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
        submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
        submissionDate: new Date(daysInThePast).valueOf().toString(),
      }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS, BANK1_MAKER1);
    });
    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      daysInThePast = sub(todayAtMidnight, { days: 35 });
      cy.updateGefApplication(deal._id, {
        ukefDecision: {
          decision: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, timestamp: getUnixTime(daysInThePast) * 1000,
        },
        status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
        submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
        submissionDate: new Date(daysInThePast).valueOf().toString(),
      }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS, BANK1_MAKER1);
    });
  });

  describe('Review UKEF decision', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative('/reports'));
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
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', dateCreated);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', submissionDate);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', dateOfApproval);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '10 days');

      daysInThePast = sub(todayAtMidnight, { days: 25 });
      submissionDate = format(parseInt(new Date(daysInThePast).valueOf().toString(), 10), 'dd LLL yyyy');
      dateOfApproval = format(parseInt(new Date(daysInThePast).valueOf().toString(), 10), 'dd LLL yyyy');
      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', dateCreated);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', submissionDate);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', dateOfApproval);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });

    it('redirects to the `Manual inclusion application with conditions` reports page', () => {
      reports.reportsConditionalDecision().click();
      cy.url().should('eq', relative('/reports/review-conditional-decision'));
      reports.reportsConditionalDecisionBreadcrumbs().should('exist');
      reports.reportsConditionalDecisionDownload().should('exist');

      submissionDate = format(todayAtMidnight, 'dd LLL yyyy');
      dateOfApproval = format(todayAtMidnight, 'dd LLL yyyy');

      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="deal__row--date-created"]').should('contain', dateCreated);
      cy.get('@row2').find('[data-cy="deal__row--submission-date"]').should('contain', submissionDate);
      cy.get('@row2').find('[data-cy="deal__row--date-of-approval"]').should('contain', dateOfApproval);
      cy.get('@row2').find('[data-cy="deal__row--days-to-review"]').should('contain', '20 days');

      daysInThePast = sub(todayAtMidnight, { days: 35 });
      submissionDate = format(parseInt(new Date(daysInThePast).valueOf().toString(), 10), 'dd LLL yyyy');
      dateOfApproval = format(parseInt(new Date(daysInThePast).valueOf().toString(), 10), 'dd LLL yyyy');
      reports.reportsUkefDecisionTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="deal__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="deal__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="deal__row--exporter"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="deal__row--date-created"]').should('contain', dateCreated);
      cy.get('@row1').find('[data-cy="deal__row--submission-date"]').should('contain', submissionDate);
      cy.get('@row1').find('[data-cy="deal__row--date-of-approval"]').should('contain', dateOfApproval);
      cy.get('@row1').find('[data-cy="deal__row--days-to-review"]').should('contain', 'days overdue');
    });
  });
});
