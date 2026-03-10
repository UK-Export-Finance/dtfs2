import relative from '../../../../relativeURL';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../../tfm/cypress/e2e/pages';

import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_DEAL_READY_TO_SUBMIT from './test-data/dealReadyToSubmit';
import { T1_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission - null currencies', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.saveSession();
  });

  after(() => {
    cy.clearSessionCookies();
  });

  it('Portal deal is submitted to UKEF, with facilities having null and non-null currencies - all currencies are handled correctly', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    portalPages.contract.visit(deal);

    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // user can login to TFM and view the submitted deal
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(T1_USER_1);

    const tfmCaseDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // checks that the currencies are either USD if were null in portal and AUD if they were not null in portal
    //---------------------------------------------------------------
    let facilityRow;

    const nullBonds = dealFacilities.filter((facility) => facility.type === 'Bond' && facility.currencySameAsSupplyContractCurrency === 'true');

    const notNullBonds = dealFacilities.filter((facility) => facility.type === 'Bond' && facility.currencySameAsSupplyContractCurrency === 'false');

    const nullLoans = dealFacilities.filter((facility) => facility.type === 'Loan' && facility.currencySameAsSupplyContractCurrency === 'true');

    const notNullLoans = dealFacilities.filter((facility) => facility.type === 'Loan' && facility.currencySameAsSupplyContractCurrency === 'false');

    nullBonds.forEach((bond) => {
      facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(bond._id);
      facilityRow.exportCurrency().then((value) => {
        facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(bond._id);
        expect(value.text()).to.contain('USD');
      });
    });

    notNullBonds.forEach((bond) => {
      facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(bond._id);
      facilityRow.exportCurrency().then((value) => {
        facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(bond._id);
        expect(value.text()).to.contain('AUD');
      });
    });

    nullLoans.forEach((loan) => {
      facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(loan._id);
      facilityRow.exportCurrency().then((value) => {
        facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(loan._id);
        expect(value.text()).to.contain('USD');
      });
    });

    notNullLoans.forEach((loan) => {
      facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(loan._id);
      facilityRow.exportCurrency().then((value) => {
        facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(loan._id);
        expect(value.text()).to.contain('AUD');
      });
    });
  });
});
