import relative from '../relativeURL';
import automaticCover from '../pages/automatic-cover';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import securityDetails from '../pages/security-details';
import applicationDetails from '../pages/application-details';
import applicationSubmission from '../pages/application-submission';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

import { todayFormattedShort } from '../../../../e2e-fixtures/dateConstants';

let dealId;

context('Submit to UKEF as MIA', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;
        cy.login(BANK1_MAKER1);
      });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Submit to UKEF', () => {
    it('application banner displays the submission date, pending UKEF deal ID and updated status', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));
      applicationDetails.automaticCoverDetailsLink().click();

      // Accept all ECs
      cy.automaticEligibilityCriteria();
      // Deny EC
      automaticCover.falseRadioButton(19).click();

      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      cy.uploadFile('test.pdf', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('test.pdf');
      manualInclusion.continueButton().click();
      cy.visit(relative(`/gef/application-details/${dealId}`));

      statusBanner.bannerStatus().contains('Draft');

      statusBanner.bannerDateCreated().contains(todayFormattedShort);

      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test');
      securityDetails.continueButton().click();
      securityDetails.visit(dealId);
      securityDetails.cancelButton().click();

      applicationDetails.submitButton().click();
    });

    it('displays correct MIA checker submission message', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/submit`));

      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle().contains('Manual inclusion application submitted for checking at your bank');
      applicationSubmission.confirmation().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Manual Inclusion Application submitted for checking at your bank');
      });
    });
  });
});
