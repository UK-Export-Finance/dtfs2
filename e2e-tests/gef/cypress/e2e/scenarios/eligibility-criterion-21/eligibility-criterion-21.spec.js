import relative from '../../relativeURL';
import automaticCover from '../../pages/automatic-cover';
import ineligibleAutomaticCover from '../../pages/ineligible-automatic-cover';
import manualInclusion from '../../pages/manual-inclusion-questionnaire';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';

let dealId;

context('Eligibility Criterion 21', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/automatic-cover`));
  });

  describe('Visiting page eligibility criteria page', () => {
    it('displays the correct elements', () => {
      automaticCover.mainHeading();
      automaticCover.form();
      automaticCover.automaticCoverTerm(21).its('length').should('be.gt', 0); // contains terms
      automaticCover.continueButton();
      automaticCover.saveAndReturnButton();
    });
  });

  describe('Selecting false on eligibility criteria 21', () => {
    it('Selecting neither of the true/false option should present an error message to the user', () => {
      // Click continue button
      automaticCover.continueButton().click();

      // Display error message on the same page
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/automatic-cover`));

      automaticCover.errorSummary().should('be.visible');
      automaticCover.errorSummary().contains('21. Select if the Obligor is involved in any additional UKEF supported facility');

      automaticCover.fieldError().should('be.visible');
      automaticCover.fieldError().contains('21. Select if the Obligor is involved in any additional UKEF supported facility');
    });

    it('The eligibility criteria have the correct aria-labels on radio buttons for true and false', () => {
      automaticCover
        .trueRadioButton(21)
        .first()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(
            'Eligibility criterion, 21, The Bank has received an Exporter Declaration which confirms that no Obligor has entered or intends to enter into any Additional UKEF Supported Facility (as defined in the relevant Exporter Declaration) within three months of the date of such Exporter Declaration and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect., true',
          );
        });

      automaticCover
        .falseRadioButton(21)
        .first()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(
            'Eligibility criterion, 21, The Bank has received an Exporter Declaration which confirms that no Obligor has entered or intends to enter into any Additional UKEF Supported Facility (as defined in the relevant Exporter Declaration) within three months of the date of such Exporter Declaration and the Bank Team is not aware that any information contained in that Exporter Declaration is inaccurate in any material respect., false',
          );
        });
    });

    it('Selecting false on criterion 21 and pressing continue should take user to manual inclusion questionnaire page', () => {
      // Other criterion
      automaticCover.trueRadioButton(12).click();
      automaticCover.trueRadioButton(13).click();
      automaticCover.trueRadioButton(14).click();
      automaticCover.trueRadioButton(15).click();
      automaticCover.trueRadioButton(16).click();
      automaticCover.trueRadioButton(17).click();
      automaticCover.trueRadioButton(18).click();
      automaticCover.trueRadioButton(19).click();
      automaticCover.trueRadioButton(20).click();

      // Criterion 21
      automaticCover.falseRadioButton(21).click();
      automaticCover.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));

      ineligibleAutomaticCover.mainHeading().contains('This is not eligible for automatic cover');
      ineligibleAutomaticCover.content().contains("You'll now need to complete a manual inclusion application.");
      ineligibleAutomaticCover.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
    });
  });
});
