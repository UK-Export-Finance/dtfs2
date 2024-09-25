import format from 'date-fns/format';
import relative from '../../../relativeURL';
import pages from '../../../pages';
import { caseSubNavigation, caseSummary } from '../../../partials';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';

context('User can view a case deal', () => {
  let dealId;
  let dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities = createdFacilities;
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should render case deal components', () => {
    caseSummary.container().should('exist');
    caseSubNavigation.container().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });

  it('should show the deal cancellation button for PIM user', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    pages.caseDealPage.cancelButton().should('exist');
  });

  it('should render case summary fields', () => {
    cy.assertText(caseSummary.dealSubmissionType(), MOCK_DEAL_AIN.submissionType);

    cy.assertText(caseSummary.exporterName(), MOCK_DEAL_AIN.exporter.companyName);
  });

  describe('Bank security section', () => {
    it('bank security section should not be displayed as AIN', () => {
      pages.caseDealPage.bankSecuritySection().should('not.exist');
      pages.caseDealPage.bankSecuritySectionHeading().should('not.exist');
      pages.caseDealPage.bankSecuritySubHeading().should('not.exist');
      pages.caseDealPage.bankSecurityText().should('not.exist');
      pages.caseDealPage.bankSecurityFacilitySubHeading().should('not.exist');
      pages.caseDealPage.bankSecurityFacilityText().should('not.exist');
    });
  });

  describe('facilities table', () => {
    it('should show a cover end date', () => {
      const facilityId = dealFacilities[0]._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      // constructs date
      const coverEndDateRaw = new Date(
        dealFacilities[0]['coverEndDate-year'],
        dealFacilities[0]['coverEndDate-month'] - 1,
        dealFacilities[0]['coverEndDate-day'],
      );
      // formats to correct format in table
      const coverEndDate = format(coverEndDateRaw, 'd MMMM yyyy');

      facilityRow.facilityCoverEndDate().contains(coverEndDate);
      facilityRow.facilityCoverEndDate().should('not.contain', '(expected)');
    });

    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities[0]._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });
  });

  describe('eligibility criteria', () => {
    it('should show the correct passed/failed criteria', () => {
      const { eligibilityCriteriaTable } = pages.caseDealPage;

      MOCK_DEAL_AIN.eligibility.criteria.forEach(({ id, answer }, index) => {
        eligibilityCriteriaTable
          .row(index + 1)
          .heading(id)
          .should('exist');
        eligibilityCriteriaTable
          .row(index + 1)
          .answerTag()
          .should('contain', answer ? 'Passed' : 'Failed');
      });
    });
  });
});
