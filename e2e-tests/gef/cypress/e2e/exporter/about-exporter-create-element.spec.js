import relative from '../relativeURL';
import aboutExporter from '../pages/about-exporter';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import CONSTANTS from '../../fixtures/constants';

const dealIds = [];
let dealWithCompletedExporter;
let token;

context('About Exporter Page - Add element to page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });

        dealWithCompletedExporter = body.items.find((deal) => deal.exporter.status === CONSTANTS.DEAL_STATUS.COMPLETED);
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  it("should not add added element's data to exporter", () => {
    cy.visit(relative(`/gef/application-details/${dealWithCompletedExporter._id}/about-exporter`));

    // adds populated text form to form
    cy.insertElement('about-exporter-form');

    aboutExporter.doneButton().click();

    // gets deal
    cy.getApplicationById(dealWithCompletedExporter._id).then((deal) => {
      // checks extra field has not been added to the exporter object
      expect(deal.exporter.intruder).to.be.an('undefined');
    });
  });
});
