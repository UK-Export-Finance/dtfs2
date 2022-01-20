import relative from '../../relativeURL';

const { GEF_DEAL_DRAFT } = require('./mocks');
const mockUsers = require('../../../fixtures/mockUsers');
const CONSTANTS = require('../../../fixtures/constants');
const { reports2 } = require('../../pages');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard: Reports', () => {
  let gefDeal;

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      gefDeal = deal;

      cy.insertOneGefFacility({
        dealId: gefDeal._id,
        ukefFacilityId: '00000001',
        type: 'Cash',
        name: 'abc-1-def',
        hasBeenIssued: false,
        value: 123,
        currency: 'GBP',
        submittedAsIssuedDate: Date.parse('2022-09-01'),
      }, BANK1_MAKER1);
      cy.setGefSubmissionType(gefDeal._id, { submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN }, BANK1_MAKER1);
      cy.setGefApplicationStatus(gefDeal._id, CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF, BANK1_MAKER1);
    });
  });

  describe('Reports page', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative('/reports'));
    });
    it('returns the reports page with unissued facilities', () => {
      reports2.allUnissuedFacilities().should('contain', 'You need to issue 1 facility');
      reports2.pastDeadlineUnissuedFacilities().should('contain', 'You have 0 facilities that have past the deadline for issuing');
      reports2.facilitiesThatNeedIssuing().should('contain', 'You have 0 facility that needs issuing');
      reports2.reviewAllUnissuedFacilities().should('exist');
    });

    it('displays the `Unissued facilities` reports page', () => {
      reports2.reviewAllUnissuedFacilities().click();
      cy.url().should('eq', relative('/reports/unissued-facilities'));
      reports2.reportsUnissuedFacilitiesBreadcrumbs().should('exist');
      reports2.reportsUnissuedFacilitiesDownload().should('exist');

      reports2.reportsUnissuedFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
      cy.get('@row1').find('[data-cy="facility__bankRef"]').should('contain', 'Draft GEF');
      cy.get('@row1').find('[data-cy="facility__product"]').should('contain', 'GEF');
      cy.get('@row1').find('[data-cy="facility__facilityId"]').should('contain', '00000001');
      cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', 'Delta');
      cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 123');
      cy.get('@row1').find('[data-cy="facility__deadlineForIssuing"]').should('contain', '20 Apr 2022');
      cy.get('@row1').find('[data-cy="facility__daysLeftToIssue"]').should('contain', '90 days left');
    });
  });
});
