const pages = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const dealAllAcknowledged = require('./deal');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

context('Checker tries to submit a deal that has changed/newly issued facilities (in `Ready for check` status) with cover start dates that are before MIN submission date', () => {
  describe('Facilities are all acknowledged with coverEndDates in the past', () => {
    let deal;
    let dealId;

    const dealFacilities = {
      bonds: [],
      loans: [],
    };

    before(() => {
      cy.deleteDeals(ADMIN);
      cy.insertOneDeal(dealAllAcknowledged, BANK1_MAKER1)
        .then((insertedDeal) => {
          deal = insertedDeal;
          dealId = deal._id;

          const { mockFacilities } = dealAllAcknowledged;

          cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
            const bonds = createdFacilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
            const loans = createdFacilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);

            dealFacilities.bonds = bonds;
            dealFacilities.loans = loans;
          });
        });
    });

    after(() => {
      dealFacilities.bonds.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });

      dealFacilities.loans.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });
    });

    it('should not throw an error for cover-end-date as all facilities acknowledged', () => {
      cy.login(BANK1_CHECKER1);
      pages.contract.visit(deal);

      pages.contract.proceedToSubmit().click();
      cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

      pages.contractConfirmSubmission.confirmSubmit().check();
      pages.contractConfirmSubmission.acceptAndSubmit().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
      });
    });
  });

  describe('Facilities are not all acknowledged with coverEndDates in the past', () => {
    let deal;
    let dealId;

    const dealFacilities = {
      bonds: [],
      loans: [],
    };

    before(() => {
      cy.deleteDeals(ADMIN);
      cy.insertOneDeal(dealAllAcknowledged, BANK1_MAKER1)
        .then((insertedDeal) => {
          deal = insertedDeal;
          dealId = deal._id;

          const { mockFacilities } = dealAllAcknowledged;
          mockFacilities[0].status = CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL;
          mockFacilities[2].status = CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL;

          cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
            const bonds = createdFacilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
            const loans = createdFacilities.filter((f) => f.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);

            dealFacilities.bonds = bonds;
            dealFacilities.loans = loans;
          });
        });
    });

    after(() => {
      dealFacilities.bonds.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });

      dealFacilities.loans.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
      });
    });

    it('should throw an error for cover-end-date as all facilities are not acknowledged', () => {
      cy.login(BANK1_CHECKER1);
      pages.contract.visit(deal);

      pages.contract.proceedToSubmit().click();
      cy.url().should('eq', relative(`/contract/${dealId}/confirm-submission`));

      pages.contractConfirmSubmission.confirmSubmit().check();
      pages.contractConfirmSubmission.acceptAndSubmit().click();

      pages.contractConfirmSubmission.expectError('Cover End Date must be today or in the future');
    });
  });
});
