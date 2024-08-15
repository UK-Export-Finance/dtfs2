import relative from '../relativeURL';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

import aboutFacilityUnissued from '../pages/unissued-facilities-about-facility';
import { DEAL_STATUS } from '../../fixtures/constants';

/**
 * NOTE: These tests check the backwards compatibility with in-flight version 0 deals.
 * A migration may need to be run on production if this test is updated.
 */
context('About unissued facility page', () => {
  let version0DealId;
  let version0FacilityId;

  before(() => {
    let token;

    cy.loadData();
    cy.insertVersion0Deal(BANK1_MAKER1.username).then(({ insertedId }) => {
      version0DealId = insertedId;
      cy.insertVersion0Facility(version0DealId).then(({ insertedId: facilityId }) => {
        version0FacilityId = facilityId;
      });
    });
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        cy.apiSetApplicationStatus(version0DealId, token, DEAL_STATUS.UKEF_ACKNOWLEDGED);
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('issuing an unissued facility', () => {
    it('does not display the facility end date questions when initially issuing the facility', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/about`));

      aboutFacilityUnissued.facilityName();
      aboutFacilityUnissued.isUsingFacilityEndDateYes().should('not.exist');
      aboutFacilityUnissued.isUsingFacilityEndDateNo().should('not.exist');
    });

    it('does not display the facility end date questions when changing the values', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/change`));

      aboutFacilityUnissued.facilityName();
      aboutFacilityUnissued.isUsingFacilityEndDateYes().should('not.exist');
      aboutFacilityUnissued.isUsingFacilityEndDateNo().should('not.exist');
    });

    it('redirects to application details page when visiting facility end date page from initially issuing', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/facility-end-date`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/about`));
    });

    it('redirects to application details page when visiting facility end date page when changing the values', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/facility-end-date/change`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/change`));
    });

    it('redirects to application details page when visiting bank review date page from initially issuing', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/bank-review-date`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/about`));
    });

    it('redirects to application details page when visiting bank review date page when changing the values', () => {
      cy.visit(relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/bank-review-date/change`));

      cy.url().should('eq', relative(`/gef/application-details/${version0DealId}/unissued-facilities/${version0FacilityId}/change`));
    });
  });
});
