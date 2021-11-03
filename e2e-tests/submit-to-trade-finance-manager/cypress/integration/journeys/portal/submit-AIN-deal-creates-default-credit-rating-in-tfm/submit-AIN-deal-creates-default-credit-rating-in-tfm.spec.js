// TODO: investigate failing tests DTFS2-5037
// import relative from '../../../relativeURL';
// import portalPages from '../../../../../../portal/cypress/integration/pages';
// import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
// import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

// import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
// import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

// const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
// const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

// context('Portal to TFM deal submission', () => {
//   let deal;
//   let dealId;
//   const dealFacilities = [];

//   before(() => {
//     cy.deleteTfmDeals();
//     cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], MAKER_LOGIN).then((insertedDeals) => {
//       [deal] = insertedDeals;
//       dealId = deal._id;

//       const { mockFacilities } = deal;

//       cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
//         dealFacilities.push(...createdFacilities);
//       });
//     });
//   });

//   after(() => {
//     dealFacilities.forEach(({ _id }) => {
//       cy.deleteFacility(_id, MAKER_LOGIN);
//     });
//     cy.deleteTfmDeals();
//   });

//   it('Portal deal is submitted to UKEF, `Good` credit rating is added to the deal in TFM', () => {
//     //---------------------------------------------------------------
//     // portal maker submits deal for review
//     //---------------------------------------------------------------
//     cy.login(MAKER_LOGIN);
//     portalPages.contract.visit(deal);
//     portalPages.contract.proceedToReview().click();
//     cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

//     portalPages.contractReadyForReview.comments().type('go');
//     portalPages.contractReadyForReview.readyForCheckersApproval().click();

//     //---------------------------------------------------------------
//     // portal checker submits deal to ukef
//     //---------------------------------------------------------------
//     cy.login(CHECKER_LOGIN);
//     portalPages.contract.visit(deal);
//     portalPages.contract.proceedToSubmit().click();

//     portalPages.contractConfirmSubmission.confirmSubmit().check();
//     portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

//     // expect to land on the /dashboard page with a success message
//     cy.url().should('include', '/dashboard');

//     //---------------------------------------------------------------
//     // user login to TFM
//     //---------------------------------------------------------------
//     // Cypress.config('tfmUrl') returns incorrect url...
//     const tfmRootUrl = 'http://localhost:5003';

//     cy.forceVisit(tfmRootUrl);

//     tfmPages.landingPage.email().type('UNDERWRITER_1');
//     tfmPages.landingPage.submitButton().click();

//     const tfmCaseDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
//     cy.forceVisit(tfmCaseDealPage);

//     tfmPartials.caseSubNavigation.underwritingLink().click();
//     cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/underwriting/pricing-and-risk`);

//     // assert elements/value in `pricing and risk` page
//     tfmPages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');

//     tfmPages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
//       expect(text.trim()).to.equal('Acceptable (B+)');
//     });

//     tfmPages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('be.visible');
//   });
// });
