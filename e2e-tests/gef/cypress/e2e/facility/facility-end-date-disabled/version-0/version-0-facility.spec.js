import relative from '../../../relativeURL';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../../../pages/application-details';
import facilities from '../../../pages/facilities';
import aboutFacility from '../../../pages/about-facility';

/**
 * NOTE: These tests check the backwards compatibility with in-flight version 0 deals.
 * A migration may need to be run on production if this test is updated.
 */
context('About Facility Page - version 0 deal', () => {
  let version0DealId;

  before(() => {
    cy.loadData();
    cy.insertVersion0Deal(BANK1_MAKER1.username).then(({ insertedId }) => {
      version0DealId = insertedId;
    });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('editing an existing unissued cash facility on a version 0 deal', () => {
    let version0FacilityId;

    before(() => {
      cy.insertVersion0Facility(version0DealId).then(({ insertedId }) => {
        version0FacilityId = insertedId;
      });
    });

    it('does not display the facility end date questions', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/facilities/${version0FacilityId}/about-facility`));

      aboutFacility.facilityName();
      aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
      aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
    });

    it('redirects to about facility page when visiting facility end date page', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/facilities/${version0FacilityId}/facility-end-date`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/facilities/${version0FacilityId}/about-facility`));
    });

    it('redirects to the about facility page when visiting bank review date page', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/facilities/${version0FacilityId}/bank-review-date`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/facilities/${version0FacilityId}/about-facility`));
    });
  });

  describe('creating a issued contingent facility on a version 0 deal', () => {
    it('does not display the facility end date questions', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}`));
      applicationDetails.addContingentFacilityButton().click();

      facilities.hasBeenIssuedRadioYesRadioButton().click();
      cy.clickContinueButton();

      aboutFacility.facilityName();
      aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
      aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
    });
  });
});
