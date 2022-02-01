import { sub } from 'date-fns';
import relative from '../../relativeURL';

const { GEF_DEAL_DRAFT } = require('./mocks');
const MOCK_USERS = require('../../../fixtures/users');
const CONSTANTS = require('../../../fixtures/constants');
const { reports } = require('../../pages');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard: Unissued facilities report', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      // 90 days left
      cy.insertOneGefFacility({
        dealId: deal._id,
        ukefFacilityId: '00000001',
        type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
        name: 'abc-1-def',
        hasBeenIssued: false,
        value: 123,
        currency: { id: 'GBP' },
      }, BANK1_MAKER1);
      cy.updateGefApplication(deal._id, { submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      // 6 days left
      const setDateToMidnight = (new Date(parseInt(Date.now(), 10))).setHours(0, 0, 1, 0);
      let daysInThePast = sub(setDateToMidnight, { days: 85 });
      daysInThePast = new Date(daysInThePast).valueOf().toString();
      cy.insertOneGefFacility({
        dealId: deal._id,
        ukefFacilityId: '00000002',
        type: CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT,
        name: 'abc-1-def',
        hasBeenIssued: false,
        value: 889988,
        currency: { id: 'EUR' },
      }, BANK1_MAKER1);
      cy.updateGefApplication(deal._id, { submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN, submissionDate: daysInThePast }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF, BANK1_MAKER1);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      // 4 days overdue
      const setDateToMidnight = (new Date(parseInt(Date.now(), 10))).setHours(0, 0, 1, 0);
      let daysInThePast = sub(setDateToMidnight, { days: 95 });
      daysInThePast = new Date(daysInThePast).valueOf().toString();
      cy.insertOneGefFacility({
        dealId: deal._id,
        ukefFacilityId: '0000003',
        type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
        name: 'abc-1-def',
        hasBeenIssued: false,
        value: 223344,
        currency: { id: 'EUR' },
      }, BANK1_MAKER1);
      cy.updateGefApplication(deal._id, { submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN, submissionDate: daysInThePast }, BANK1_MAKER1);
      cy.setGefApplicationStatus(deal._id, CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF, BANK1_MAKER1);
    });
  });

  describe('Unissued facilities Report', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative('/reports'));
    });
    it('returns the reports page with unissued facilities', () => {
      reports.allUnissuedFacilities().should('contain', 'You need to issue 3 facilities');
      reports.pastDeadlineUnissuedFacilities().should('contain', 'You have 1 facility that has past the deadline for issuing');
      reports.facilitiesThatNeedIssuing().should('contain', 'You have 1 facility that needs issuing');
      reports.reviewAllUnissuedFacilities().should('exist');
    });

    it('displays the `Unissued facilities` reports page', () => {
      reports.reviewAllUnissuedFacilities().click();
      cy.url().should('eq', relative('/reports/review-unissued-facilities'));
      reports.reportsUnissuedFacilitiesBreadcrumbs().should('exist');
      reports.reportsUnissuedFacilitiesDownload().should('exist');

      reports.reportsUnissuedFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="facility__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="facility__row--product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="facility__row--facilityId"]').should('contain', '0000003');
      cy.get('@row1').find('[data-cy="facility__row--companyName"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="facility__row--facilityValue"]').should('contain', 'EUR 223,344');
      cy.get('@row1').find('[data-cy="facility__row--daysLeftToIssue"]').should('contain', 'days overdue');

      reports.reportsUnissuedFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
      cy.get('@row2').find('[data-cy="facility__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row2').find('[data-cy="facility__row--product"]').should('contain', 'GEF');
      cy.get('@row2').find('[data-cy="facility__row--facilityId"]').should('contain', '00000002');
      cy.get('@row2').find('[data-cy="facility__row--companyName"]').should('contain', 'Delta');
      cy.get('@row2').find('[data-cy="facility__row--facilityValue"]').should('contain', 'EUR 889,988');
      cy.get('@row2').find('[data-cy="facility__row--daysLeftToIssue"]').should('contain', 'days left');

      reports.reportsUnissuedFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
      cy.get('@row3').find('[data-cy="facility__row--bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row3').find('[data-cy="facility__row--product"]').should('contain', 'GEF');
      cy.get('@row3').find('[data-cy="facility__row--facilityId"]').should('contain', '00000001');
      cy.get('@row3').find('[data-cy="facility__row--companyName"]').should('contain', 'Delta');
      cy.get('@row3').find('[data-cy="facility__row--facilityValue"]').should('contain', 'GBP 123');
      cy.get('@row3').find('[data-cy="facility__row--daysLeftToIssue"]').should('contain', '90 days left');
    });
  });
});
