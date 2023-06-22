const MOCK_USERS = require('../../../fixtures/users');
const { contract } = require('../../pages');
const { MOCK_BOND, MOCK_LOAN } = require('../../../fixtures/mockFacilities');
const { DEALS, FACILITY } = require('../../../fixtures/constants');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Amend a facility', () => {
  describe('Amend a facility', () => {
    const MOCK_DEAL = {
      bankInternalRefName: 'dealId',
      additionalRefName: 'dealName',
    };

    let dealWithAmendableFacilities;
    let amendableBond;
    let amendableLoan;

    let notAcknowledgedDeal;
    let notAcknowledgedBond;
    let notAcknowledgedLoan;

    let dealWithUnissuedFacilities;
    let unissuedBond;
    let unissuedLoan;

    const facilitiesToCleanUp = [];

    const createMockFacility = (baseMockFacility, isIssued) => ({
      ...baseMockFacility,
      facilityStage: isIssued ? FACILITY.FACILITY_STAGE.ISSUED : FACILITY.FACILITY_STAGE.UNISSUED,
    });

    const createDealWithFacilities = (setDealCallback, setBondCallback, setLoanCallback, status, areFacilitiesIssued) => {
      cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1)
        .then((insertedDeal) => {
          const dealUpdates = { ...insertedDeal, status };

          cy.updateDeal(insertedDeal._id, dealUpdates, BANK1_MAKER1)
            .then((updatedDeal) => {
              setDealCallback(updatedDeal);

              const mockBond = createMockFacility(MOCK_BOND, areFacilitiesIssued);
              const mockLoan = createMockFacility(MOCK_LOAN, areFacilitiesIssued);

              cy.createFacilities(updatedDeal._id, [mockBond, mockLoan], BANK1_MAKER1)
                .then((createdFacilities) => {
                  setBondCallback(createdFacilities.filter((f) => f.type === 'Bond')[0]);
                  setLoanCallback(createdFacilities.filter((f) => f.type === 'Loan')[0]);

                  facilitiesToCleanUp.push(...createdFacilities);
                });
            });
        });
    };

    before(() => {
      cy.deleteDeals(ADMIN);
      createDealWithFacilities(
        (deal) => { dealWithAmendableFacilities = deal; },
        (bond) => { amendableBond = bond; },
        (loan) => { amendableLoan = loan; },
        DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
        true,
      );

      createDealWithFacilities(
        (deal) => { notAcknowledgedDeal = deal; },
        (bond) => { notAcknowledgedBond = bond; },
        (loan) => { notAcknowledgedLoan = loan; },
        DEALS.DEAL_STATUS.UKEF_IN_PROGRESS,
        true,
      );

      createDealWithFacilities(
        (deal) => { dealWithUnissuedFacilities = deal; },
        (bond) => { unissuedBond = bond; },
        (loan) => { unissuedLoan = loan; },
        DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
        false,
      );
    });

    beforeEach(() => {
      cy.saveSession();
    });

    after(() => {
      facilitiesToCleanUp.forEach((facility) => {
        cy.deleteFacility(facility._id, ADMIN);
      });
    });

    it('shows amend facility link for makers and acknowledged deals', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(dealWithAmendableFacilities);

      contract.bondTransactionsTable.row(amendableBond._id).createFacilityAmendmentLink().should('exist');
      contract.loansTransactionsTable.row(amendableLoan._id).createFacilityAmendmentLink().should('exist');
    });

    it('does not show amend facility link if user is not a maker', () => {
      cy.login(BANK1_CHECKER1);
      contract.visit(dealWithAmendableFacilities);

      contract.bondTransactionsTable.row(amendableBond._id).createFacilityAmendmentLink().should('not.exist');
      contract.loansTransactionsTable.row(amendableLoan._id).createFacilityAmendmentLink().should('not.exist');
    });

    it('does not show amend facility link if the deal is not acknowledged', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(notAcknowledgedDeal);

      contract.bondTransactionsTable.row(notAcknowledgedBond._id).createFacilityAmendmentLink().should('not.exist');
      contract.loansTransactionsTable.row(notAcknowledgedLoan._id).createFacilityAmendmentLink().should('not.exist');
    });

    it('does not show amend facility link if facilities are unissued', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(dealWithUnissuedFacilities);

      contract.bondTransactionsTable.row(unissuedBond._id).createFacilityAmendmentLink().should('not.exist');
      contract.loansTransactionsTable.row(unissuedLoan._id).createFacilityAmendmentLink().should('not.exist');
    });
  });
});
