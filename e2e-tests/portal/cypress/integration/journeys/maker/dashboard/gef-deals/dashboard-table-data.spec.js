const { gefDashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
// slight oddity- this test seems to need a straight 'maker'; so filtering slightly more than in other tests..
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));

const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/;

context('View a deal', () => {
  context('no checker', () => {
    let deal;

    const dummyDeal = {
      bankId: MAKER_LOGIN.bank.id,
      bankInternalRefName: 'Mock GEF exporter',
    };

    beforeEach(() => {
      // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
      cy.on('uncaught:exception', (err, runnable) => {
        console.log(err.stack);
        return false;
      });

      // same or gef
      cy.deleteGefApplications(MAKER_LOGIN);
      cy.insertOneGefApplication(dummyDeal, MAKER_LOGIN)
        .then((insertedDeal) => { deal = insertedDeal; });
    });

    it('A created GEF deal appears on the dashboard', () => {
      // login and go to dashboard
      cy.login(MAKER_LOGIN);
      gefDashboard.visit();

      const id = deal._id;

      const {
        bankRef, product, updated, link,
      } = gefDashboard.row;

      bankRef(id).invoke('text').then((text) => {
        expect(text.trim()).equal('Mock GEF exporter');
      });

      product(id).invoke('text').then((text) => {
        expect(text.trim()).equal('GEF');
      });

      // TODO: add check for status when statuses for GEF are finalised

      updated(id).invoke('text').then((text) => {
        expect(text.trim()).to.match(regexDateTime);
      });

      link(id).click();

      cy.url().should('eq', relative(`/gef/application-details/${id}`));
    });
  });
});
