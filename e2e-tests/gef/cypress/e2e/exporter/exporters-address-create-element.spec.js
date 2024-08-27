import relative from '../relativeURL';
import { continueButton } from '../partials';
import exportersAddress from '../pages/exporters-address';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import selectExportersCorAddress from '../pages/select-exporters-corr-address';
import { POSTCODE } from '../../fixtures/constants';

let dealId;

context('Exporters Address Page - Add element to page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/exporters-address`));
  });

  it("should not add added element's data to exporter correspondence address", () => {
    exportersAddress.yesRadioButton().click();
    exportersAddress.correspondenceAddress().type(POSTCODE.VALID);

    // adds populated text element to form
    cy.insertElement('separate-correspondence-form');
    continueButton().click();

    selectExportersCorAddress.selectAddress().select('0');
    continueButton().click();
    continueButton().click();

    cy.getApplicationById(dealId).then((deal) => {
      // checks extra field has not been added to the exporter correspondenceAddress object
      expect(deal.exporter.correspondenceAddress.intruder).to.be.an('undefined');
    });
  });
});
