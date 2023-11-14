import format from 'date-fns/format';
import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { T1_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('User can view a case deal', () => {
  let dealId;
  let dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
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
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });

  it('should render case summary fields', () => {
    partials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_DEAL_AIN.submissionType);
    });

    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_DEAL_AIN.exporter.companyName);
    });
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
      const coverEndDateRaw = new Date(dealFacilities[0]['coverEndDate-year'], dealFacilities[0]['coverEndDate-month'] - 1, dealFacilities[0]['coverEndDate-day']);
      // formats to correct format in table
      const coverEndDate = format(coverEndDateRaw, 'd MMMM yyyy');

      facilityRow.facilityEndDate().contains(coverEndDate);
      facilityRow.facilityEndDate().should('not.contain', '(expected)');
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
      eligibilityCriteriaTable.row(1).heading(11).should('exist');
      eligibilityCriteriaTable.row(1).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(2).heading(12).should('exist');
      eligibilityCriteriaTable.row(2).answerTag().contains('Failed');
      eligibilityCriteriaTable.row(3).heading(13).should('exist');
      eligibilityCriteriaTable.row(3).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(4).heading(14).should('exist');
      eligibilityCriteriaTable.row(4).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(5).heading(15).should('exist');
      eligibilityCriteriaTable.row(6).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(6).heading(16).should('exist');
      eligibilityCriteriaTable.row(7).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(7).heading(17).should('exist');
      eligibilityCriteriaTable.row(8).answerTag().contains('Passed');
      eligibilityCriteriaTable.row(8).heading(18).should('exist');
    });
  });
});
