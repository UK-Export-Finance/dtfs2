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
      manualInclusion.templateLinkDocx();
      manualInclusion.templateLinkPdf();
      manualInclusion.fileUploadComponent();
      manualInclusion.continueButton();
      manualInclusion.cancelLink();
    });

    it('displays the correct text for questionnaire download', () => {
      manualInclusion.templateLinkDocx().contains('Download Manual Inclusion Questionnaire.docx (49KB)');
      manualInclusion.templateLinkDocx().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/gef/assets/files/GEF Manual Inclusion Questionnaire.docx');
      });

      manualInclusion.templateLinkPdf().contains('Download Manual Inclusion Questionnaire.pdf (92KB)');
      manualInclusion.templateLinkPdf().invoke('attr', 'href').then((href) => {
        expect(href).to.equal('/gef/assets/files/GEF Manual Inclusion Questionnaire.pdf');
      });
    });

    it('has a template to download', () => {
      cy.document()
        .then((doc) => {
          const templateUrlDocx = doc.querySelector('[data-cy=template-link-docx]').getAttribute('href');
          cy.request({ url: templateUrlDocx }).then((response) => {
            expect(response.status).to.equal(200);
          });
        });

      cy.document()
        .then((doc) => {
          const templateUrlPdf = doc.querySelector('[data-cy=template-link-pdf]').getAttribute('href');
          cy.request({ url: templateUrlPdf }).then((response) => {
            expect(response.status).to.equal(200);
          });
        });
    });

    it('does not allow continue if no files are uploaded', () => {
      manualInclusion.continueButton().click();
      manualInclusion.errorSummary();
    });

    it('does not allow a file of an incorrect type', () => {
      cy.uploadFile('upload-file-wrong-type.csv', `/gef/application-details/${id}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadFailure('upload-file-wrong-type.csv');
    });

    it('displays the application page when pressing Cancel', () => {
      manualInclusion.cancelLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${id}`));
    });
  });
});
