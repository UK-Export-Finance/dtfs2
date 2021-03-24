/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import aboutExporter from './pages/about-exporter';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;
let token;

context('About Exporter Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        applicationId = body.items[0]._id;
        // exporterId = body.items[0].exporterId;
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/about-exporter`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      aboutExporter.backLink();
      aboutExporter.headingCaption();
      aboutExporter.mainHeading();
      aboutExporter.form();
      aboutExporter.industryTitle();
      aboutExporter.industry();
      aboutExporter.microRadioButton();
      aboutExporter.smallRadioButton();
      aboutExporter.mediumRadioButton();
      aboutExporter.notSMERadioButton();
      aboutExporter.probabilityOfDefaultInput();
      aboutExporter.isFinancingIncreasingRadioYes();
      aboutExporter.isFinancingIncreasingRadioNo();
      aboutExporter.continueButton();
      aboutExporter.saveAndReturnButton();
    });
  });
});
