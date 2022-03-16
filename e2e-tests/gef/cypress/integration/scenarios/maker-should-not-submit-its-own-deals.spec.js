import relative from '../relativeURL';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import applicationSubmission from '../pages/application-submission';
import facilityConfirmDeletion from '../pages/facility-confirm-deletion';
import aboutFacility from '../pages/about-facility';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import securityDetails from '../pages/security-details';
import uploadFIles from '../pages/upload-files';
import CREDENTIALS from '../../fixtures/credentials.json';
import applicationPreview from '../pages/application-preview';
import returnToMaker from '../pages/return-to-maker';
import statusBanner from '../pages/application-status-banner';

context('Create application as MAKER, submit application to UKEF as MAKER_CHECKER', () => {
  const dealIds = [];

  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('DTFS2-4698 MakerChecker should not be able to submit own edited deals', () => {
    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker/checker and return to the maker with a comment.
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().click();
      returnToMaker.comment().type('nope');
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');

      // could update the application as the maker/checker
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();

      // it displays the comments from the checker
      applicationPreview.comments();
      applicationPreview.comments().contains('nope');

      // it allows the maker/checker to submit to be checked at the bank
      // submit the application to be checked again
      applicationDetails.submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Hello');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // it changes the status to Ready for Checker's approval
      // view the application as the maker/checker
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      statusBanner.bannerStatus().contains("Ready for Checker's approval");

      // the ability to return the application or submit to ukef should not be visible
      applicationPreview.submitButton().should('not.exist');
      applicationPreview.returnButton().should('not.exist');
    });
  });
});

context('Create application as MAKER, edit as MAKER_CHECKER and try to submit application to UKEF as MAKER_CHECKER', () => {
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('BANK1_MAKER1 makes application, MakerChecker edits only eligibility criteria, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker/checker and return to the maker with a comment.
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });

  describe('BANK1_MAKER1 makes application, MakerChecker deletes facility only, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      // login as maker_checker only to delete facility and then relogin as maker to submit to checker
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      applicationDetails.deleteFacilityLink().first().click();
      facilityConfirmDeletion.deleteButton().click();

      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });

  describe('BANK1_MAKER1 makes application, MakerChecker edits facility only, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      // login as maker_checker to edit a facility and then relogin as maker
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      applicationDetails.facilitySummaryListRowAction(0, 0).click();
      aboutFacility.saveAndReturnButton().click();

      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });

  describe('BANK1_MAKER1 makes application, MakerChecker adds document only, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.saveAndReturnButton().click();

      // login as maker_checker to add a file only and then complete as maker
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}/supporting-information/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');

      cy.login(CREDENTIALS.MAKER);
      securityDetails.visit(dealIds[2]);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      securityDetails.continueButton().click();

      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });

  describe('BANK1_MAKER1 makes application, MakerChecker deletes document only, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/ineligible-automatic-cover`));
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/supporting-information/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');
      securityDetails.visit(dealIds[2]);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      securityDetails.continueButton().click();

      // login as maker_checker only to delete a file.  file readded as maker
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      uploadFIles.supportingInfoManualInclusionButton().click();
      uploadFIles.deleteSupportingDocument('upload-file-valid.doc').click();

      cy.login(CREDENTIALS.MAKER);

      cy.visit(relative(`/gef/application-details/${dealIds[2]}/supporting-information/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');

      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });

  describe('BANK1_MAKER1 makes application, MakerChecker adds security questions only, MakerChecker should not be able to submit to ukef', () => {
    const dealIds = [];

    before(() => {
      cy.reinsertMocks();
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((token) => token)
        .then((token) => {
          cy.apiFetchAllApplications(token);
        })
        .then(({ body }) => {
          body.items.forEach((item) => {
            dealIds.push(item._id);
          });
        });
    });

    it('does not allow a maker/checker to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/ineligible-automatic-cover`));
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/supporting-information/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');

      // login as maker/checker only to fill in security questions
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      securityDetails.visit(dealIds[2]);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      securityDetails.continueButton().click();

      cy.login(CREDENTIALS.MAKER);

      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });
});
