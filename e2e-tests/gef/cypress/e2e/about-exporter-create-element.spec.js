import relative from './relativeURL';
import aboutExporter from './pages/about-exporter';
import CREDENTIALS from '../fixtures/credentials.json';
import CONSTANTS from '../fixtures/constants';

const dealIds = [];
let dealWithCompletedExporter;
let token;

context('About Exporter Page - Add element to page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });

        dealWithCompletedExporter = body.items.find((deal) =>
          deal.exporter.status === CONSTANTS.DEAL_STATUS.COMPLETED);
      });
    cy.login(CREDENTIALS.MAKER);
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
