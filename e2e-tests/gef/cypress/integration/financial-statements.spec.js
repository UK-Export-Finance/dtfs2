/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import financialStatements from './pages/financial-statements';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;
let id;

context('Financial Statements Page', () => {
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
                facilities: res.body.items.filter((it) => it.details.applicationId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    id = applications[1].id;
  });

  describe('Visiting financial statements page', () => {
    beforeEach(() => {
      cy.visit(relative(financialStatements.url(id)));
    });

    it('displays the correct elements', () => {
      financialStatements.headingCaption();
      financialStatements.mainHeading();
      financialStatements.fileUploadComponent();
      financialStatements.continueButton();
      financialStatements.cancelLink();
    });

    it('does not allow continue if no files are uploaded', () => {
      financialStatements.continueButton().click();
      financialStatements.errorSummary();
    });

    it('does not allow a file greater than 12MB', () => {
      cy.uploadFile('upload-file-large.pdf', `${financialStatements.url(id)}/upload`);
      financialStatements.uploadFailure('upload-file-large.pdf');
    });

    it('does not allow a file of an incorrect type', () => {
      cy.uploadFile('upload-file-wrong-type.csv', `${financialStatements.url(id)}/upload`);
      financialStatements.uploadFailure('upload-file-wrong-type.csv');
    });

    it('allows a file of the correct type', () => {
      financialStatements.fileUploadComponent().attachFile('upload-file-valid.doc');
      financialStatements.uploadSuccess('upload-file-valid.doc');
    });

    it('returns to the application details page when pressing Continue', () => {
      financialStatements.fileUploadComponent().attachFile('upload-file-valid.doc');
      financialStatements.continueButton()
        .click();
      cy.url()
        .should('eq', relative(`/gef/application-details/${id}`));
    });

    it('displays the application page when pressing Cancel', () => {
      financialStatements.cancelLink()
        .click();
      cy.url()
        .should('eq', relative(`/gef/application-details/${id}`));
    });
  });
});
