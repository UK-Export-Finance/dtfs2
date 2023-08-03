import relative from './relativeURL';
import exportersAddress from './pages/exporters-address';
import CREDENTIALS from '../fixtures/credentials.json';
import selectExportersCorAddress from './pages/select-exporters-corr-address';
import { POSTCODE } from '../fixtures/constants';

let dealId;

context('Exporters Address Page - Add element to page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(CREDENTIALS.MAKER);
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
    exportersAddress.continueButton().click();

    selectExportersCorAddress.selectAddress().select('0');
    selectExportersCorAddress.continueButton().click();
    selectExportersCorAddress.continueButton().click();

    cy.getApplicationById(dealId).then((deal) => {
      // checks extra field has not been added to the exporter correspondenceAddress object
      expect(deal.exporter.correspondenceAddress.intruder).to.be.an('undefined');
    });
  });
});
