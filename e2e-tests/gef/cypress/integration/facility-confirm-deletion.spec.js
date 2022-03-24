import relative from './relativeURL';
import facilityConfirmDeletion from './pages/facility-confirm-deletion';
import applicationDetails from './pages/application-details';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Facility Confirm Deletion Page', () => {
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

  describe('Visiting page as cash facility', () => {
    it('delete facility link contains an aria-label with facility name', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}`));
      applicationDetails.deleteFacilityLink().first().contains('Delete facility');
      applicationDetails.deleteFacilityLink().first().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal(`Delete facility ${applications[2].facilities[3].details.name}`);
      });
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/confirm-deletion`));
      facilityConfirmDeletion.mainHeading().should('contain', 'Cash');
      facilityConfirmDeletion.content();
      facilityConfirmDeletion.deleteButton();
      facilityConfirmDeletion.keepButton();
    });

    it('redirects user back to application page when clicking on `No, Keep` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/confirm-deletion`));
      facilityConfirmDeletion.keepButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('redirects user back to application page when clicking on `Yes, delete` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/confirm-deletion`));
      facilityConfirmDeletion.deleteButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/confirm-deletion`));
      facilityConfirmDeletion.mainHeading().should('contain', 'Contingent');
      facilityConfirmDeletion.content();
      facilityConfirmDeletion.deleteButton();
      facilityConfirmDeletion.keepButton();
    });
  });
});
