import relative from '../../relativeURL';
import pages from '../../pages';
import { caseSummary, caseSubNavigation } from '../../partials';
import { MOCK_APPLICATION_MIA, MOCK_APPLICATION_AIN } from '../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../fixtures/mock-gef-facilities';
import { T1_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import { DEAL_TYPE } from '../../../fixtures/constants';
import facilityPage from '../../pages/facilityPage';

context('User can view a GEF MIA case deal', () => {
  let dealId;
  let dealFacilities;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_MIA, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities = createdFacilities.details;
      });

      cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
  });

  it('should render case deal components', () => {
    caseSummary.container().should('exist');
    caseSubNavigation.container().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });

  it('should render case summary fields', () => {
    caseSummary
      .dealSubmissionType()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain(MOCK_APPLICATION_MIA.submissionType);
      });

    caseSummary
      .exporterName()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain(MOCK_APPLICATION_MIA.exporter.companyName);
      });
  });

  describe('Bank security section', () => {
    it('bank security section should be displayed as MIA', () => {
      pages.caseDealPage.bankSecuritySection().should('exist');
      pages.caseDealPage.bankSecuritySectionHeading().contains('Bank security');
      pages.caseDealPage.bankSecuritySubHeading().contains('General bank security for this exporter');
      pages.caseDealPage.bankSecurityText().contains('Mock security details');
      pages.caseDealPage.bankSecurityFacilitySubHeading().contains('Specific bank security for the facilities listed in this application');
      pages.caseDealPage.bankSecurityFacilityText().contains('Mock facility details');
    });
  });

  describe('facilities table', () => {
    it('facility coverEndDate should be a dash', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityEndDate().contains('-');
    });

    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });

    it('Premium schedule contains the feeType in the How bank will pay field', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      facilityPage.facilityTabPremiumSchedule().click();

      facilityPage.facilityFeeType().contains(dealFacilities.feeType);
    });
  });

  describe('eligibility criteria', () => {
    it('should show the correct passed/failed criteria', () => {
      const { eligibilityCriteriaTable } = pages.caseDealPage;

      MOCK_APPLICATION_MIA.eligibility.criteria.forEach(({ id, answer }, index) => {
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

context('User can view a GEF AIN case deal', () => {
  let dealId;
  let dealFacilities;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities = createdFacilities.details;
      });

      cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
  });

  it('should render case deal components', () => {
    caseSummary.container().should('exist');
    caseSubNavigation.container().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
  });

  it('should render case summary fields', () => {
    caseSummary
      .dealSubmissionType()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain(MOCK_APPLICATION_AIN.submissionType);
      });

    caseSummary
      .exporterName()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain(MOCK_APPLICATION_AIN.exporter.companyName);
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
    it('facility coverEndDate should be a dash', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityEndDate().contains('-');
    });

    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });

    it('coverStartDate and coverEndDate should be a dash on the facility details page', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      facilityPage.facilityCoverStartDate().contains('-');
      facilityPage.facilityCoverEndDate().contains('-');
    });

    it('Premium schedule contains the feeType in the How bank will pay field', () => {
      const facilityId = dealFacilities._id;
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      facilityPage.facilityTabPremiumSchedule().click();

      facilityPage.facilityFeeType().contains(dealFacilities.feeType);
    });
  });

  describe('eligibility criteria', () => {
    it('should show the correct passed/failed criteria', () => {
      const { eligibilityCriteriaTable } = pages.caseDealPage;

      MOCK_APPLICATION_AIN.eligibility.criteria.forEach(({ id, answer }, index) => {
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
