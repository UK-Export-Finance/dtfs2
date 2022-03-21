import relative from '../../relativeURL';
import pages from '../../pages';
import partials from '../../partials';
import { MOCK_APPLICATION_MIA, MOCK_APPLICATION_AIN } from '../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../fixtures/mock-gef-facilities';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';
import { DEAL_TYPE } from '../../../fixtures/constants';
import facilityPage from '../../pages/facilityPage';

context('User can view a GEF MIA case deal', () => {
  let dealId;
  let dealFacilities;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;
        // updates a gef deal so has relevant fields
        cy.updateGefDeal(dealId, MOCK_APPLICATION_MIA, MOCK_MAKER_TFM);

        cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities = createdFacilities.details;
        });

        cy.submitDeal(dealId, DEAL_TYPE.GEF);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render case summary fields', () => {
    partials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_APPLICATION_MIA.submissionType);
    });

    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_APPLICATION_MIA.exporter.companyName);
    });
  });

  // enable once set
  // it('should render correct MGA version', () => {
  //   pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  // });

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
  });
});

context('User can view a GEF AIN case deal', () => {
  let dealId;
  let dealFacilities;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;
        // updates a gef deal so has relevant fields
        cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, MOCK_MAKER_TFM);

        cy.createGefFacilities(dealId, [MOCK_FACILITY_ONE], MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities = createdFacilities.details;
        });

        cy.submitDeal(dealId, DEAL_TYPE.GEF);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render case summary fields', () => {
    partials.caseSummary.dealSubmissionType().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_APPLICATION_AIN.submissionType);
    });

    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).to.contain(MOCK_APPLICATION_AIN.exporter.companyName);
    });
  });

  // enable once set
  // it('should render correct MGA version', () => {
  //   pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  // });

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
  });
});
