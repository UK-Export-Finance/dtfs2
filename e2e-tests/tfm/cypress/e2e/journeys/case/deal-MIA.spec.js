import format from 'date-fns/format';
import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('User can view a case deal', () => {
  let dealId;
  let dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

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
    dealFacilities.forEach(({ _id }) => {
      cy.deleteFacility(_id, BANK1_MAKER1);
    });
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });

  it('should render case summary fields', () => {
    cy.assertText(partials.caseSummary.dealSubmissionType(), MOCK_DEAL_MIA.submissionType);

    cy.assertText(partials.caseSummary.exporterName(), MOCK_DEAL_MIA.exporter.companyName);
  });

  describe('Bank security section', () => {
    it('bank security section should be displayed as MIA', () => {
      pages.caseDealPage.bankSecuritySection().should('exist');
      pages.caseDealPage.bankSecuritySectionHeading().contains('Bank security');
      pages.caseDealPage.bankSecuritySubHeading().contains('General bank security for this exporter');
      pages.caseDealPage.bankSecurityText().contains('Mock security details');
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
      const coverEndDate = format(coverEndDateRaw, 'dd MMMM yyyy');

      facilityRow.facilityEndDate().contains(coverEndDate);
      facilityRow.facilityEndDate().contains('(expected)');
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

      MOCK_DEAL_MIA.eligibility.criteria.forEach(({ id, answer }, index) => {
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
