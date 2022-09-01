const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const { dashboardDeals } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  BSS_DEAL_AIN,
  BSS_DEAL_READY_FOR_CHECK,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - filter by multiple fields with multiple values', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    const BSS_DEAL_MIA_MOCK = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    cy.insertOneDeal(BSS_DEAL_MIA_MOCK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
    // changes company name and pushes to deals
    const BSS_DEAL_MIA_A = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_A.exporter.companyName = 'Aaa';
    cy.insertOneDeal(BSS_DEAL_MIA_A, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_Z = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_Z.exporter.companyName = 'Zzzz';
    cy.insertOneDeal(BSS_DEAL_AIN_Z, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_C = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_C.exporter.companyName = 'Ccc';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_C, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_Q = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_Q.exporter.companyName = 'Qqqqq';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_Q, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_MIA_U = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_U.exporter.companyName = 'Uuuu';
    cy.insertOneDeal(BSS_DEAL_MIA_U, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_G = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_G.exporter.companyName = 'Gggg';
    cy.insertOneDeal(BSS_DEAL_AIN_G, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_L = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_L.exporter.companyName = 'Llll';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_L, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_R = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_R.exporter.companyName = 'Rrrr';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_R, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_MIA_S = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_S.exporter.companyName = 'Ssss';
    cy.insertOneDeal(BSS_DEAL_MIA_S, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_T = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_T.exporter.companyName = 'Tttt';
    cy.insertOneDeal(BSS_DEAL_AIN_T, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_W = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_W.exporter.companyName = 'Wwww';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_W, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_P = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_P.exporter.companyName = 'Pppp';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_P, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_MIA_Y = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_Y.exporter.companyName = 'Yyyy';
    cy.insertOneDeal(BSS_DEAL_MIA_Y, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_D = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_D.exporter.companyName = 'Dddd';
    cy.insertOneDeal(BSS_DEAL_AIN_D, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_N = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_N.exporter.companyName = 'Nnnn';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_N, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_H = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_H.exporter.companyName = 'Hhhhh';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_H, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_J = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_J.exporter.companyName = 'Jjjj';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_J, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_E = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_E.exporter.companyName = 'Eeee';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_E, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_MIA_B = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_B.exporter.companyName = 'Bbbb';
    cy.insertOneDeal(BSS_DEAL_MIA_B, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_X = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_X.exporter.companyName = 'Xxxx';
    cy.insertOneDeal(BSS_DEAL_AIN_X, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_K = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_K.exporter.companyName = 'Kkkk';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_K, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const GEF_DEAL_DRAFT_I = JSON.parse(JSON.stringify(GEF_DEAL_DRAFT));
    GEF_DEAL_DRAFT_I.exporter.companyName = 'Iiii';
    cy.insertOneGefApplication(GEF_DEAL_DRAFT_I, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_MIA_F = JSON.parse(JSON.stringify(BSS_DEAL_MIA));
    BSS_DEAL_MIA_F.exporter.companyName = 'Ffff';
    cy.insertOneDeal(BSS_DEAL_MIA_F, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_AIN_H = JSON.parse(JSON.stringify(BSS_DEAL_AIN));
    BSS_DEAL_AIN_H.exporter.companyName = 'Hhhh';
    cy.insertOneDeal(BSS_DEAL_AIN_H, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    const BSS_DEAL_READY_FOR_CHECK_V = JSON.parse(JSON.stringify(BSS_DEAL_READY_FOR_CHECK));
    BSS_DEAL_READY_FOR_CHECK_V.exporter.companyName = 'Vvvv';
    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK_V, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('Sort dashboard alphabetically - Company name', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should have the deals in insertion order (not alphabetical)', () => {
      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[25].exporter.companyName);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[6].exporter.companyName);

      dashboardDeals.next().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[5].exporter.companyName);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[0].exporter.companyName);
    });

    it('should sort alphabetically ascending if exporter is clicked ', () => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));

      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[1].exporter.companyName);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[10].exporter.companyName);

      dashboardDeals.next().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[5].exporter.companyName);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[2].exporter.companyName);
    });

    it('should sort alphabetically descending if exporter is clicked twice', () => {
      cy.login(BANK1_MAKER1);
      dashboardDeals.visit();
      cy.url().should('eq', relative('/dashboard/deals/0'));

      dashboardDeals.exporterButton().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[2].exporter.companyName);

      dashboardDeals.rows().eq(19).find('td').eq(0)
        .contains(ALL_DEALS[6].exporter.companyName);

      dashboardDeals.next().click();
      dashboardDeals.exporterButton().click();
      dashboardDeals.exporterButton().click();

      dashboardDeals.rows().eq(0).find('td').eq(0)
        .contains(ALL_DEALS[23].exporter.companyName);

      dashboardDeals.rows().eq(5).find('td').eq(0)
        .contains(ALL_DEALS[1].exporter.companyName);
    });
  });
});
