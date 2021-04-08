/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import aboutFacility from './pages/about-facility';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('About Facility Page', () => {
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
                facilityIds: res.body.items.filter((it) => it.details.applicationId === item._id), // .map((it) => it.details._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    console.log('applications', applications);
    cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilityIds[2].details._id}/about-facility`));
  });

  describe('Visiting page with already issued cash facility', () => {
    it('displays the correct elements', () => {
      aboutFacility.backLink();
      aboutFacility.headingCaption();
      aboutFacility.mainHeading().contains('cash');
      aboutFacility.mainHeading().should('not.contain', 'contingent');
      aboutFacility.form();
      aboutFacility.facilityName();
      aboutFacility.shouldCoverStartOnSubmissionYes();
      aboutFacility.shouldCoverStartOnSubmissionNo();
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.be', 'visible');
    });

    // it('redirects user to enter exporters address page when clicking on `Back` Link', () => {
    //   aboutExporter.backLink().click();
    //   cy.url().should('eq', relative(`/gef/application-details/${applicationIds[1]}/enter-exporters-correspondence-address`));
    // });

    // it('displays selected Industry string', () => {
    //   cy.visit(relative(`/gef/application-details/${applicationIds[1]}/about-exporter`));
    //   aboutExporter.industry();
    // });

    // it('displays no industry options', () => {
    //   cy.visit(relative(`/gef/application-details/${applicationIds[1]}/about-exporter`));
    //   aboutExporter.industries().should('be', 'invisible');
    // });
  });

  // describe('Visiting page with multiple industries', () => {
  //   it('displays the correct amount of industries', () => {
  //     cy.visit(relative(`/gef/application-details/${applicationIds[2]}/about-exporter`));
  //     aboutExporter.industries().find('input[type="radio"]').its('length').should('be.eq', 3);
  //   });
  // });

  // describe('Clicking on Done', () => {
  //   it('validates form', () => {
  //     cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
  //     aboutExporter.doneButton().click();
  //     aboutExporter.errorSummary();
  //     aboutExporter.probabilityOfDefaultError();
  //     aboutExporter.isFinancingIncreasingError();
  //   });

  //   it('takes user back to application details page when form has been filled in', () => {
  //     cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
  //     aboutExporter.microRadioButton().click();
  //     aboutExporter.probabilityOfDefaultInput().type('20');
  //     aboutExporter.isFinancingIncreasingRadioYes().click();
  //     aboutExporter.doneButton().click();
  //     cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0]}`));
  //   });
  // });

  // describe('Clicking on Save and return, bypasses validation and takes user back to application details page', () => {
  //   it('validates form', () => {
  //     cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
  //     aboutExporter.saveAndReturnButton().click();
  //     cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0]}`));
  //   });
  // });
});
