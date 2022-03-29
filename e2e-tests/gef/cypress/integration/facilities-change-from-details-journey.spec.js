import relative from './relativeURL';
import applicationDetails from './pages/application-details';
import facilities from './pages/facilities';
import aboutFacility from './pages/about-facility';
import providedFacility from './pages/provided-facility';
import facilityValue from './pages/facility-value';
import facilityCurrency from './pages/facility-currency';
import facilityGuarantee from './pages/facility-guarantee';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Changing facility details from application-details page should take you to next page on facilities journey', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token)
            .then((res) => {
              applications.push({
                id: item._id,
                facilities: res.body.items.filter((it) => it.details.dealId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Next page on facility journey', () => {
    it('should take you to about-facility page from hasBeenIssued page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 1).click();
      facilities.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/about-facility`));
    });

    it('should take you to provided-facility page from about-facility page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 0).click();
      aboutFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/provided-facility`));
    });

    it('should take you to facility-currency page from provided-facility page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 3).click();
      providedFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/facility-currency`));
    });

    it('should take you to facility-value page from facility-currency page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 4).click();
      facilityCurrency.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/facility-value?status=change`));
    });

    it('should take you to facility-guarantee page from facility-value page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 6).click();
      facilityValue.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/facility-guarantee`));
    });

    it('should take you to application-details page from facility-guarantee page', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.facilitySummaryListRowAction(0, 8).click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });
  });
});
