const MOCK_USERS = require('../../../fixtures/users');
const { contract } = require('../../pages');
const { MOCK_BOND, MOCK_LOAN } = require('../../../fixtures/mockFacilities');

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

    const facilitiesToCleanUp = [];

    const createDealWithFacilities = (setDealCallback, setBondCallback, setLoanCallback) => {
      cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1)
        .then((insertedDeal) => {
          setDealCallback(insertedDeal);

          cy.createFacilities(insertedDeal._id, [MOCK_BOND, MOCK_LOAN], BANK1_MAKER1)
            .then((createdFacilities) => {
              setBondCallback(createdFacilities.filter((f) => f.type === 'Bond')[0]);
              setLoanCallback(createdFacilities.filter((f) => f.type === 'Loan')[0]);

              facilitiesToCleanUp.push(...createdFacilities);
            });
        });
    };

    before(() => {
      cy.deleteDeals(ADMIN);
      createDealWithFacilities(
        (deal) => { dealWithAmendableFacilities = deal; },
        (bond) => { amendableBond = bond; },
        (loan) => { amendableLoan = loan; },
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

    it('shows amend facility link for makers', () => {
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
  });
});
