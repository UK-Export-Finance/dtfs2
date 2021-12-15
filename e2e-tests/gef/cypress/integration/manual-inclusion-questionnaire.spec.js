import relative from './relativeURL';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;
let id;

context('manual inclusion Page', () => {
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
    id = applications[1].id;
  });

  describe('Visiting manual inclusion page', () => {
    beforeEach(() => {
      cy.visit(relative(manualInclusion.url(id)));
    });

    it('displays the correct elements', () => {
      manualInclusion.headingCaption();
      manualInclusion.mainHeading();
      manualInclusion.templateLink();
      manualInclusion.fileUploadComponent();
      manualInclusion.continueButton();
      manualInclusion.cancelLink();
    });

    it('has a template to download', () => {
      cy.document()
        .then((doc) => {
          const templateUrl = doc.querySelector('[data-cy=template-link]').getAttribute('href');
          cy.request({ url: templateUrl }).then((response) => {
            expect(response.status).to.equal(200);
          });
        });
    });

    it('does not allow continue if no files are uploaded', () => {
      manualInclusion.continueButton().click();
      manualInclusion.errorSummary();
    });

    // TODO: DTFS2-5089
    // it('does not allow a file greater than 12MB', () => {
    //   cy.uploadFile('upload-larger-file.pdf', `${manualInclusion.url(id)}/upload`);
    //   manualInclusion.uploadFailure('upload-larger-file.pdf');
    // });

    it('does not allow a file of an incorrect type', () => {
      cy.uploadFile('upload-file-wrong-type.csv', `${manualInclusion.url(id)}/upload`);
      manualInclusion.uploadFailure('upload-file-wrong-type.csv');
    });

    it('displays the application page when pressing Cancel', () => {
      manualInclusion.cancelLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${id}`));
    });
  });
});
